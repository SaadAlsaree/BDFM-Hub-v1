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

  // Process the org data into nodes and edges for React Flow based on layout type
  const processOrgData = useCallback(
    (data: IOrganizationalUnitTree[], layout: LayoutType) => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // Early return if data is not valid
      if (!data || !Array.isArray(data) || data.length === 0) {
        return { nodes, edges };
      }

      function processNodeHierarchical(
        node: IOrganizationalUnitTree,
        level: number,
        xOffset: number
      ) {
        if (!node || !node.id) return;

        nodes.push({
          id: node.id!,
          type: 'orgUnit',
          position: { x: xOffset, y: level * 200 },
          data: {
            unitName: node.unitName || '',
            unitCode: node.unitCode || '',
            unitLevel: node.unitLevel || 0,
            canReceiveExternalMail: node.canReceiveExternalMail || false,
            canSendExternalMail: node.canSendExternalMail || false
          }
        });

        if (node.children && node.children.length > 0) {
          const childWidth = 350;
          const totalWidth = node.children.length * childWidth;
          const startX = xOffset - totalWidth / 2 + childWidth / 2;

          node.children.forEach((child, index) => {
            if (!child || !child.id) return;

            edges.push({
              id: `e-${node.id}-${child.id}`,
              source: node.id!,
              target: child.id!,
              type: 'smoothstep',
              style: { stroke: '#b1b1b7', strokeWidth: 2 }
            });

            processNodeHierarchical(
              child,
              level + 1,
              startX + index * childWidth
            );
          });
        }
      }

      function processNodeHorizontal(
        node: IOrganizationalUnitTree,
        level: number,
        yOffset: number
      ) {
        if (!node || !node.id) return;

        nodes.push({
          id: node.id!,
          type: 'orgUnit',
          position: { x: level * 400, y: yOffset },
          data: {
            unitName: node.unitName || '',
            unitCode: node.unitCode || '',
            unitLevel: node.unitLevel || 0,
            canReceiveExternalMail: node.canReceiveExternalMail || false,
            canSendExternalMail: node.canSendExternalMail || false
          }
        });

        if (node.children && node.children.length > 0) {
          const childHeight = 200;
          const totalHeight = node.children.length * childHeight;
          const startY = yOffset - totalHeight / 2 + childHeight / 2;

          node.children.forEach((child, index) => {
            if (!child || !child.id) return;

            edges.push({
              id: `e-${node.id}-${child.id}`,
              source: node.id!,
              target: child.id!,
              type: 'smoothstep',
              style: { stroke: '#b1b1b7', strokeWidth: 2 }
            });

            processNodeHorizontal(
              child,
              level + 1,
              startY + index * childHeight
            );
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

        const x = Math.cos(angle) * radius * 400;
        const y = Math.sin(angle) * radius * 400;

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
          const angleStep = (2 * Math.PI) / node.children.length;
          node.children.forEach((child, index) => {
            if (!child || !child.id) return;

            edges.push({
              id: `e-${node.id}-${child.id}`,
              source: node.id!,
              target: child.id!,
              type: 'smoothstep',
              style: { stroke: '#b1b1b7', strokeWidth: 2 }
            });

            const childAngle = angle + angleStep * index;
            processNodeRadial(child, level + 1, childAngle, radius + 1.5);
          });
        }
      }

      // Process based on layout type
      data.forEach((rootNode, index) => {
        switch (layout) {
          case 'horizontal':
            processNodeHorizontal(rootNode, 0, index * 400);
            break;
          case 'radial':
            processNodeRadial(
              rootNode,
              0,
              (index * 2 * Math.PI) / data.length,
              2
            );
            break;
          default: // hierarchical
            processNodeHierarchical(rootNode, 0, index * 500);
        }
      });

      return { nodes, edges };
    },
    []
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
  }, [initialData, processOrgData, setNodes, setEdges, layoutType]);

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

  const onLayoutChange = useCallback((newLayout: LayoutType) => {
    setLayoutType(newLayout);
  }, []);

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
          padding: 0.3,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 1.2
        }}
        attributionPosition='bottom-right'
        minZoom={0.1}
        maxZoom={2}
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
