'use client';

import { useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import OrgUnitNode from './OrgUnitNode';
import { Card } from '@/components/ui/card';
import {
  IconRefresh,
  IconLayoutGrid,
  IconCircles,
  IconArrowsDiagonal
} from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IOrganizationalUnitTree } from '../types/organizational';

type LayoutType = 'hierarchical' | 'horizontal' | 'radial';

interface OrganizationalUnitFlowProps {
  initialData: IOrganizationalUnitTree[];
}

// The main component wrapped with ReactFlowProvider
export function OrganizationalUnitFlow({
  initialData
}: OrganizationalUnitFlowProps) {
  return (
    <ReactFlowProvider>
      <FlowContent initialData={initialData} />
    </ReactFlowProvider>
  );
}

// The actual flow content component
function FlowContent({ initialData }: OrganizationalUnitFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [layoutType, setLayoutType] = useState<LayoutType>('hierarchical');

  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      orgUnit: OrgUnitNode
    }),
    []
  );

  // Helper function to calculate tree dimensions for hierarchical layout
  const calculateTreeWidth = useCallback(
    (node: IOrganizationalUnitTree): number => {
      if (!node || !node.children || node.children.length === 0) {
        return 250; // Base width for a single node
      }

      let totalWidth = 0;
      node.children.forEach((child) => {
        totalWidth += calculateTreeWidth(child);
      });

      // Add spacing between children (dynamic based on number of children)
      const childSpacing = Math.max(80, 20 * node.children.length);
      return Math.max(
        totalWidth + (node.children.length - 1) * childSpacing,
        250
      );
    },
    []
  );

  // Helper function to calculate tree height for horizontal layout
  const calculateTreeHeight = useCallback(
    (node: IOrganizationalUnitTree): number => {
      if (!node || !node.children || node.children.length === 0) {
        return 180; // Base height for a single node
      }

      let maxHeight = 0;
      node.children.forEach((child) => {
        maxHeight = Math.max(maxHeight, calculateTreeHeight(child));
      });

      // Add spacing between children
      const childSpacing = Math.max(60, 15 * node.children.length);
      return Math.max(
        maxHeight + (node.children.length - 1) * childSpacing,
        180
      );
    },
    []
  );

  // Process the org data into nodes and edges for React Flow based on layout type
  const processOrgData = useCallback(
    (data: IOrganizationalUnitTree[], layout: LayoutType) => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // Early return if data is not valid
      if (!data || !Array.isArray(data) || data.length === 0) {
        return { nodes, edges };
      }

      // Constants for spacing
      const MIN_HORIZONTAL_SPACING = 100;
      const MIN_VERTICAL_SPACING = 250;
      const MIN_HORIZONTAL_LEVEL_SPACING = 400;

      function processNodeHierarchical(
        node: IOrganizationalUnitTree,
        level: number,
        xOffset: number
      ) {
        if (!node || !node.id) return;

        // Dynamic vertical spacing based on level and tree depth
        const verticalSpacing = MIN_VERTICAL_SPACING + level * 20;

        nodes.push({
          id: node.id!,
          type: 'orgUnit',
          position: { x: xOffset, y: level * verticalSpacing },
          data: {
            unitName: node.unitName || '',
            unitCode: node.unitCode || '',
            unitLevel: node.unitLevel || 0,
            canReceiveExternalMail: node.canReceiveExternalMail || false,
            canSendExternalMail: node.canSendExternalMail || false
          }
        });

        if (node.children && node.children.length > 0) {
          // Calculate widths for all children
          const childWidths = node.children.map((child) =>
            calculateTreeWidth(child)
          );
          const totalWidth = childWidths.reduce((sum, width) => sum + width, 0);

          // Dynamic spacing between children based on their count
          const childSpacing = Math.max(
            MIN_HORIZONTAL_SPACING,
            30 + node.children.length * 10
          );
          const totalSpacing = (node.children.length - 1) * childSpacing;
          const totalRequiredWidth = totalWidth + totalSpacing;

          // Start position to center children under parent
          let currentX = xOffset - totalRequiredWidth / 2;

          node.children.forEach((child, index) => {
            if (!child || !child.id) return;

            const childTreeWidth = childWidths[index];
            const childCenterX = currentX + childTreeWidth / 2;

            edges.push({
              id: `e-${node.id}-${child.id}`,
              source: node.id!,
              target: child.id!,
              type: 'smoothstep',
              style: { stroke: '#b1b1b7', strokeWidth: 2 }
            });

            processNodeHierarchical(child, level + 1, childCenterX);

            // Move to next child position
            currentX += childTreeWidth + childSpacing;
          });
        }
      }

      function processNodeHorizontal(
        node: IOrganizationalUnitTree,
        level: number,
        yOffset: number
      ) {
        if (!node || !node.id) return;

        // Dynamic horizontal spacing based on level
        const horizontalSpacing = MIN_HORIZONTAL_LEVEL_SPACING + level * 50;

        nodes.push({
          id: node.id!,
          type: 'orgUnit',
          position: { x: level * horizontalSpacing, y: yOffset },
          data: {
            unitName: node.unitName || '',
            unitCode: node.unitCode || '',
            unitLevel: node.unitLevel || 0,
            canReceiveExternalMail: node.canReceiveExternalMail || false,
            canSendExternalMail: node.canSendExternalMail || false
          }
        });

        if (node.children && node.children.length > 0) {
          // Calculate heights for all children
          const childHeights = node.children.map((child) =>
            calculateTreeHeight(child)
          );
          const totalHeight = childHeights.reduce(
            (sum, height) => sum + height,
            0
          );

          // Dynamic spacing between children
          const childSpacing = Math.max(80, 20 + node.children.length * 8);
          const totalSpacing = (node.children.length - 1) * childSpacing;
          const totalRequiredHeight = totalHeight + totalSpacing;

          // Start position to center children beside parent
          let currentY = yOffset - totalRequiredHeight / 2;

          node.children.forEach((child, index) => {
            if (!child || !child.id) return;

            const childTreeHeight = childHeights[index];
            const childCenterY = currentY + childTreeHeight / 2;

            edges.push({
              id: `e-${node.id}-${child.id}`,
              source: node.id!,
              target: child.id!,
              type: 'smoothstep',
              style: { stroke: '#b1b1b7', strokeWidth: 2 }
            });

            processNodeHorizontal(child, level + 1, childCenterY);

            // Move to next child position
            currentY += childTreeHeight + childSpacing;
          });
        }
      }

      function processNodeRadial(
        node: IOrganizationalUnitTree,
        level: number,
        angle: number,
        radius: number
      ) {
        if (!node || !node.id) return;

        // Dynamic radius calculation based on level and number of children
        const baseRadius = 350;
        const radiusMultiplier = radius + level * 0.3;
        const dynamicRadius = baseRadius * radiusMultiplier;

        const x = Math.cos(angle) * dynamicRadius;
        const y = Math.sin(angle) * dynamicRadius;

        nodes.push({
          id: node.id!,
          type: 'orgUnit',
          position: { x, y },
          data: {
            unitName: node.unitName || '',
            unitCode: node.unitCode || '',
            unitLevel: node.unitLevel || 0,
            canReceiveExternalMail: node.canReceiveExternalMail || false,
            canSendExternalMail: node.canSendExternalMail || false
          }
        });

        if (node.children && node.children.length > 0) {
          // Dynamic angle step - distribute children evenly
          const angleStep = (2 * Math.PI) / node.children.length;

          // Calculate radius increment based on level and number of children
          const radiusIncrement = 1.2 + (node.children.length > 5 ? 0.3 : 0);

          node.children.forEach((child, index) => {
            if (!child || !child.id) return;

            edges.push({
              id: `e-${node.id}-${child.id}`,
              source: node.id!,
              target: child.id!,
              type: 'smoothstep',
              style: { stroke: '#b1b1b7', strokeWidth: 2 }
            });

            // Calculate child angle with slight offset for better visualization
            const childAngle = angle + angleStep * index;
            processNodeRadial(
              child,
              level + 1,
              childAngle,
              radius + radiusIncrement
            );
          });
        }
      }

      // Process based on layout type with improved spacing for multiple roots
      data.forEach((rootNode, index) => {
        switch (layout) {
          case 'horizontal': {
            // Calculate starting Y offset based on previous trees' heights
            let yOffset = 0;
            for (let i = 0; i < index; i++) {
              const prevTreeHeight = calculateTreeHeight(data[i]);
              yOffset += prevTreeHeight + 300; // Add spacing between root trees
            }
            processNodeHorizontal(rootNode, 0, yOffset);
            break;
          }
          case 'radial': {
            // Distribute root nodes evenly in a circle
            const rootAngle = (index * 2 * Math.PI) / data.length;
            processNodeRadial(rootNode, 0, rootAngle, 1.5);
            break;
          }
          default: // hierarchical
            // Calculate starting X offset based on previous trees' widths
            let xOffset = 0;
            for (let i = 0; i < index; i++) {
              const prevTreeWidth = calculateTreeWidth(data[i]);
              xOffset += prevTreeWidth + 400; // Add spacing between root trees
            }
            processNodeHierarchical(rootNode, 0, xOffset);
        }
      });

      return { nodes, edges };
    },
    [calculateTreeWidth, calculateTreeHeight]
  );

  // Initialize and update the flow with the selected layout
  useMemo(() => {
    if (
      !initialData ||
      !Array.isArray(initialData) ||
      initialData.length === 0
    ) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: flowNodes, edges: flowEdges } = processOrgData(
      initialData,
      layoutType
    );
    setNodes(flowNodes);
    setEdges(flowEdges);

    // Auto fit view after nodes are updated (with delay to ensure rendering)
    if (reactFlowInstance && flowNodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView({
          duration: 600,
          padding: 0.25,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 1.5
        });
      }, 150);
    }
  }, [
    initialData,
    processOrgData,
    setNodes,
    setEdges,
    layoutType,
    reactFlowInstance
  ]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const resetView = useCallback(() => {
    if (!reactFlowInstance) return;
    reactFlowInstance.fitView({
      duration: 800,
      padding: 0.3,
      includeHiddenNodes: false,
      minZoom: 0.1,
      maxZoom: 1.2
    });
    setSelectedNode(null);
  }, [reactFlowInstance]);

  const onLayoutChange = useCallback(
    (newLayout: LayoutType) => {
      setLayoutType(newLayout);
      // Auto fit view after layout change (with a small delay to ensure nodes are rendered)
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({
            duration: 800,
            padding: 0.2,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 1.5
          });
        }
      }, 100);
    },
    [reactFlowInstance]
  );

  return (
    <Card className='h-[700px] overflow-hidden'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onInit={setReactFlowInstance}
        fitView
        fitViewOptions={{
          padding: 0.25,
          includeHiddenNodes: false,
          minZoom: 0.05,
          maxZoom: 1.5
        }}
        attributionPosition='bottom-right'
        minZoom={0.05}
        maxZoom={2.5}
      >
        <Controls />
        <MiniMap />
        <Background color='#f0f0f0' gap={16} size={1} />

        <Panel position='top-right' className='flex flex-col gap-3'>
          <Card className='p-3'>
            <div className='mb-2 text-sm font-medium'>أدوات التحكم</div>
            <div className='flex flex-col gap-2'>
              <Select
                value={layoutType}
                onValueChange={(value: LayoutType) => onLayoutChange(value)}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue placeholder='اختر نوع العرض' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='hierarchical'>
                    <div className='flex items-center gap-2'>
                      <IconLayoutGrid size={16} />
                      <span>عرض هرمي</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='horizontal'>
                    <div className='flex items-center gap-2'>
                      <IconArrowsDiagonal size={16} />
                      <span>عرض أفقي</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='radial'>
                    <div className='flex items-center gap-2'>
                      <IconCircles size={16} />
                      <span>عرض دائري</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={resetView}
                className='flex items-center gap-1 rounded bg-blue-50 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-100'
              >
                <IconRefresh size={16} />
                إعادة تعيين العرض
              </button>
            </div>
          </Card>

          {selectedNode && (
            <Card className='p-3'>
              <div className='mb-2 text-sm font-medium'>تفاصيل الجهة</div>
              <div className='space-y-1'>
                <div className='font-medium'>{selectedNode.data.unitName}</div>
                <div className='text-xs text-gray-600'>
                  الرمز: {selectedNode.data.unitCode}
                </div>
                <div className='text-xs text-gray-600'>
                  المستوى: {selectedNode.data.unitLevel}
                </div>
                <div className='mt-2 space-y-1'>
                  <div className='flex items-center gap-1 text-xs'>
                    <span
                      className={`h-2 w-2 rounded-full ${selectedNode.data.canReceiveExternalMail ? 'bg-green-500' : 'bg-red-500'}`}
                    ></span>
                    <span className='text-gray-600'>
                      استقبال البريد الخارجي
                    </span>
                  </div>
                  <div className='flex items-center gap-1 text-xs'>
                    <span
                      className={`h-2 w-2 rounded-full ${selectedNode.data.canSendExternalMail ? 'bg-blue-500' : 'bg-red-500'}`}
                    ></span>
                    <span className='text-gray-600'>إرسال البريد الخارجي</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </Panel>
      </ReactFlow>
    </Card>
  );
}
