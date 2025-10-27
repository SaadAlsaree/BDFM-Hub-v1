const { QdrantClient } = require('@qdrant/js-client-rest');

async function fixCollectionDimensions() {
   const client = new QdrantClient({
      url: 'http://localhost:6333'
   });

   const collectionName = 'bdfm_correspondences';
   const correctVectorSize = 768;

   try {
      console.log(`Fixing collection ${collectionName} dimensions to ${correctVectorSize}...`);

      // Get current collection info
      const currentInfo = await client.getCollection(collectionName);
      const currentSize = currentInfo.config?.params?.vectors?.size;

      console.log(`Current collection dimensions: ${currentSize}`);
      console.log(`Expected dimensions: ${correctVectorSize}`);

      if (currentSize === correctVectorSize) {
         console.log(`Collection ${collectionName} already has correct dimensions (${correctVectorSize})`);
         return;
      }

      console.log('Rebuilding collection with correct dimensions...');

      // Delete existing collection
      await client.deleteCollection(collectionName);
      console.log(`Deleted collection: ${collectionName}`);

      // Create new collection with correct dimensions
      await client.createCollection(collectionName, {
         vectors: {
            size: correctVectorSize,
            distance: 'Cosine'
         },
         optimizers_config: {
            default_segment_number: 2
         },
         replication_factor: 1
      });

      console.log(`Collection ${collectionName} rebuilt successfully with ${correctVectorSize} dimensions`);
   } catch (error) {
      console.error(`Error fixing collection dimensions:`, error);
      throw error;
   }
}

// Run the fix
fixCollectionDimensions()
   .then(() => {
      console.log('Dimension fix completed successfully');
      process.exit(0);
   })
   .catch((error) => {
      console.error('Dimension fix failed:', error);
      process.exit(1);
   });
