// Mock Product Data for Development
// This file provides mock product data until database integration is complete
// Structured to match the expected database schema for easy migration

export interface MockCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageUrl?: string;
}

export interface MockProduct {
    id: number;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: string;
    categoryId: number;
    category?: MockCategory;
    images: Array<{
        url: string;
        altText: string;
    }>;
    inStock: boolean;
    stockQuantity: number;
    sku: string;
    featured?: boolean;
}

// Product Categories
export const mockCategories: MockCategory[] = [
    {
        id: 1,
        name: 'Aquaponics',
        slug: 'aquaponics',
        description: 'Complete aquaponics systems and components for sustainable fish and plant cultivation',
        imageUrl: '/src/lib/images/AI-MockAssets/ToolProduct-AquaPonic.png'
    },
    {
        id: 2,
        name: 'Hydroponics',
        slug: 'hydroponics',
        description: 'Hydroponic systems, nutrients, and growing media for soil-free cultivation',
        imageUrl: '/src/lib/images/AI-MockAssets/ToolProduct-HydroPonic.png'
    },
    {
        id: 3,
        name: 'Silvopasture',
        slug: 'silvopasture',
        description: 'Silvopasture systems integrating trees, forage, and livestock',
        imageUrl: '/src/lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-SilvopastureSeedMix.png'
    },
    {
        id: 4,
        name: 'Agroforestry',
        slug: 'agroforestry',
        description: 'Agroforestry products and tree-based agricultural systems',
        imageUrl: '/src/lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-TreeShelters&Protectors.png'
    },
    {
        id: 5,
        name: 'Kits & Collections',
        slug: 'kits',
        description: 'Curated starter kits and complete growing collections',
        imageUrl: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-PermacultureStarterKit.png'
    },
    {
        id: 6,
        name: 'Plants & Seeds',
        slug: 'plants',
        description: 'Heirloom seeds, medicinal herbs, and plant starts',
        imageUrl: '/src/lib/images/AI-MockAssets/PlantProduct-TOMATO.png'
    },
    {
        id: 7,
        name: 'Tools & Equipment',
        slug: 'tools',
        description: 'Quality hand tools and equipment for sustainable agriculture',
        imageUrl: '/src/lib/images/AI-MockAssets/ToolProduct-TROWL.png'
    }
];

// Mock Products
export const mockProducts: MockProduct[] = [
    // Aquaponics Products
    {
        id: 1,
        name: 'Countertop Aquaponics Starter System',
        slug: 'countertop-aquaponics-starter',
        description: 'Perfect for beginners, this compact countertop aquaponics system combines a clear acrylic fish tank with a grow bed for fresh herbs and greens. Watch the complete nitrogen cycle in action as fish waste nourishes your plants. Includes everything you need to get started: tank, grow bed, water pump, air pump, and detailed setup guide.',
        shortDescription: 'Compact system perfect for growing fresh herbs and greens on your kitchen counter',
        price: '189.99',
        categoryId: 1,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/ToolProduct-AquaPonic.png',
                altText: 'Countertop Aquaponics System with fish and plants'
            }
        ],
        inStock: true,
        stockQuantity: 24,
        sku: 'AQ-STARTER-001',
        featured: true
    },
    {
        id: 2,
        name: 'Commercial Aquaponics Grow Bed',
        slug: 'commercial-aquaponics-grow-bed',
        description: 'Professional-grade grow bed designed for commercial aquaponics operations. Features food-grade liner, optimal depth for root development, and integrated flood-and-drain system. Holds 50 gallons of growing media and can support 20-30 mature plants. Durable construction built to last for years of continuous production.',
        shortDescription: 'Professional grow bed for commercial-scale aquaponics production',
        price: '449.99',
        categoryId: 1,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/ToolProduct-AquaponicBed.png',
                altText: 'Large commercial aquaponics grow bed with plants'
            }
        ],
        inStock: true,
        stockQuantity: 8,
        sku: 'AQ-GROWBED-001'
    },
    {
        id: 3,
        name: 'IBC Aquaponics Fish Tank System',
        slug: 'ibc-aquaponics-fish-tank',
        description: 'Convert a standard IBC tote into a professional aquaponics fish tank with this complete conversion kit. Includes viewing window, bulkhead fittings, standpipe, and all necessary plumbing. 275-gallon capacity perfect for tilapia, koi, or goldfish. Food-grade materials ensure fish and plant safety.',
        shortDescription: '275-gallon IBC tote conversion kit for aquaponics fish cultivation',
        price: '299.99',
        categoryId: 1,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/ToolProduct-AquaponicFishTank.png',
                altText: 'IBC tote aquaponics fish tank with viewing window'
            }
        ],
        inStock: true,
        stockQuantity: 12,
        sku: 'AQ-TANK-IBC-001'
    },
    {
        id: 4,
        name: 'Aquaponics Bell Siphon Kit',
        slug: 'aquaponics-bell-siphon',
        description: 'Essential component for flood-and-drain aquaponics systems. This precision-engineered bell siphon provides reliable, automatic cycling of water through your grow beds. Adjustable flow rate accommodates different bed sizes. Clear construction allows you to see the siphon in action. Includes detailed installation instructions.',
        shortDescription: 'Automatic flood-and-drain siphon for aquaponics grow beds',
        price: '34.99',
        categoryId: 1,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/ToolProduct-AquaponicsBellSiphonKit.png',
                altText: 'Clear bell siphon assembly for aquaponics'
            }
        ],
        inStock: true,
        stockQuantity: 45,
        sku: 'AQ-SIPHON-001'
    },
    {
        id: 5,
        name: 'Aquaponics Water Testing Kit',
        slug: 'aquaponics-water-testing-kit',
        description: 'Complete water quality testing kit specifically designed for aquaponics systems. Test for pH, ammonia, nitrite, nitrate, and temperature - all critical parameters for healthy fish and plants. Includes 100+ tests, color comparison charts, and detailed guide for interpreting results and making adjustments.',
        shortDescription: 'Professional water testing kit for monitoring aquaponics system health',
        price: '49.99',
        categoryId: 1,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/ToolProduct-AquaponicsWaterTestingKit.png',
                altText: 'Water testing kit with test tubes and solutions'
            }
        ],
        inStock: true,
        stockQuantity: 67,
        sku: 'AQ-TEST-001',
        featured: true
    },
    {
        id: 6,
        name: 'Tilapia Fingerlings Guide',
        slug: 'tilapia-fingerlings-guide',
        description: 'Comprehensive illustrated guide to raising tilapia in aquaponics systems. Covers fingerling selection, stocking density, feeding schedules, growth rates, and harvest timing. Beautiful botanical-style illustrations show different growth stages. Essential reading for anyone starting with tilapia aquaponics.',
        shortDescription: 'Educational guide for raising tilapia in aquaponics systems',
        price: '24.99',
        categoryId: 1,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/ToolProduct-AquaponicsTilapiaFingerlings.png',
                altText: 'Illustrated guide showing tilapia growth stages'
            }
        ],
        inStock: true,
        stockQuantity: 150,
        sku: 'AQ-GUIDE-TILAPIA-001'
    },

    // Hydroponic Products
    {
        id: 7,
        name: 'NFT Hydroponic Channel System',
        slug: 'nft-channel-system',
        description: 'Professional Nutrient Film Technique (NFT) system with 8 channels for maximum production. Each channel holds 12 net pots for a total of 96 plants. Continuous nutrient flow ensures optimal growth. Perfect for lettuce, herbs, and leafy greens. Includes reservoir, pump, and all necessary fittings. Expandable design allows you to add more channels as you grow.',
        shortDescription: 'Professional NFT system for high-density leafy green production',
        price: '599.99',
        categoryId: 2,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/HydroToolProduct-NFTHydroponicChannelSystem.png',
                altText: 'NFT hydroponic channels with growing lettuce'
            }
        ],
        inStock: true,
        stockQuantity: 6,
        sku: 'HY-NFT-001',
        featured: true
    },
    {
        id: 8,
        name: 'Deep Water Culture Bucket System',
        slug: 'dwc-bucket-system',
        description: 'Simple yet highly effective DWC system perfect for growing large plants like tomatoes, peppers, and herbs. 5-gallon food-grade bucket with net pot lid, air stone, and airline. Roots suspended in oxygenated nutrient solution for explosive growth. Easy to maintain and monitor. Great for beginners and experienced growers alike.',
        shortDescription: 'Single-bucket DWC system ideal for tomatoes, peppers, and large herbs',
        price: '39.99',
        categoryId: 2,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/HydroToolProduct-DeepWaterCulture(DWC)Bucket System.png',
                altText: 'DWC bucket with healthy basil plant'
            }
        ],
        inStock: true,
        stockQuantity: 89,
        sku: 'HY-DWC-001'
    },
    {
        id: 9,
        name: 'Vertical Tower Garden System',
        slug: 'vertical-tower-garden',
        description: 'Maximize your growing space with this 6-foot vertical tower system. Grow up to 36 plants in just 2 square feet of floor space! Perfect for patios, balconies, or small indoor spaces. Automated drip irrigation from top ensures even nutrient distribution. Ideal for strawberries, herbs, lettuce, and other compact plants. Includes tower, reservoir, pump, timer, and growing medium.',
        shortDescription: 'Space-saving vertical tower for growing 36 plants in 2 square feet',
        price: '379.99',
        categoryId: 2,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/HydroToolProduct-VerticalTowerGardenSystem.png',
                altText: 'Tall vertical tower garden with strawberries and herbs'
            }
        ],
        inStock: true,
        stockQuantity: 15,
        sku: 'HY-TOWER-001',
        featured: true
    },
    {
        id: 10,
        name: 'Complete Hydroponic Grow Tent Kit',
        slug: 'hydroponic-grow-tent-kit',
        description: 'Everything you need for indoor hydroponic growing in one complete package. 4x4 foot grow tent with reflective mylar interior, 600W full-spectrum LED grow light, ventilation system with carbon filter, oscillating fan, and 6-plant DWC system. Perfect for year-round growing of vegetables, herbs, or flowers. Detailed setup guide included.',
        shortDescription: 'All-in-one grow tent kit with lights, ventilation, and hydroponic system',
        price: '899.99',
        categoryId: 2,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/HydroToolProduct-HydroponicGrowTentKit.png',
                altText: 'Interior of grow tent with LED lights and plants'
            }
        ],
        inStock: true,
        stockQuantity: 4,
        sku: 'HY-TENT-KIT-001'
    },
    {
        id: 11,
        name: 'Hydroponic Nutrients Trio',
        slug: 'hydroponic-nutrients-trio',
        description: 'Professional 3-part nutrient system for all growth stages. Grow formula for vegetative growth, Bloom formula for flowering and fruiting, and Micro for essential micronutrients. pH balanced and highly concentrated - a little goes a long way. Suitable for all hydroponic systems and growing media. Each bottle makes 100+ gallons of nutrient solution.',
        shortDescription: 'Complete 3-part nutrient system for all hydroponic growing stages',
        price: '54.99',
        categoryId: 2,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/HydroToolProduct-HydroponicNutrientsTrio.png',
                altText: 'Three bottles of hydroponic nutrients'
            }
        ],
        inStock: true,
        stockQuantity: 156,
        sku: 'HY-NUTRIENTS-001'
    },
    {
        id: 12,
        name: 'Rockwool Cubes & Growing Media Set',
        slug: 'rockwool-growing-media',
        description: 'Variety pack of premium growing media for hydroponics. Includes rockwool starter cubes for seedlings, expanded clay pebbles (hydroton) for net pots, coco coir for moisture retention, and perlite for aeration. Everything you need to start seeds and transplant to your hydroponic system. Enough media for 50+ plants.',
        shortDescription: 'Complete growing media variety pack for hydroponic systems',
        price: '44.99',
        categoryId: 2,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/HydroToolProduct-RockwoolCubes&GrowingMedia.png',
                altText: 'Assorted hydroponic growing media with seedlings'
            }
        ],
        inStock: true,
        stockQuantity: 78,
        sku: 'HY-MEDIA-001'
    },
    {
        id: 13,
        name: 'Digital pH & EC Meter Set',
        slug: 'ph-ec-meter-set',
        description: 'Professional-grade digital meters for precise nutrient solution monitoring. pH meter accurate to 0.01, EC meter measures electrical conductivity and TDS. Both feature automatic temperature compensation and easy calibration. Includes calibration solutions, storage solutions, and protective cases. Essential tools for serious hydroponic growers.',
        shortDescription: 'Professional digital meters for monitoring pH and nutrient strength',
        price: '89.99',
        categoryId: 2,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/HydroToolProduct-RockwoolCubes&GrowingMedia.png',
                altText: 'Digital pH and EC meters with calibration solutions'
            }
        ],
        inStock: true,
        stockQuantity: 34,
        sku: 'HY-METER-001'
    },
    {
        id: 14,
        name: 'Net Pots & Clay Pebbles Bundle',
        slug: 'net-pots-clay-pebbles',
        description: 'Complete bundle of net pots and expanded clay pebbles. Includes 50 net pots in assorted sizes (2", 3", and 4") and 10 liters of premium hydroton clay pebbles. Net pots feature wide slits for excellent root development and aeration. Clay pebbles are pH neutral, reusable, and provide excellent drainage and oxygen to roots.',
        shortDescription: '50 net pots with 10L of premium expanded clay pebbles',
        price: '39.99',
        categoryId: 2,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/HydroToolProduct-HydroponicNetPots&ClayPebbles.png',
                altText: 'Net pots filled with clay pebbles and seedlings'
            }
        ],
        inStock: true,
        stockQuantity: 92,
        sku: 'HY-NETPOT-001'
    },
    {
        id: 15,
        name: 'Aeroponic Misting System',
        slug: 'aeroponic-misting-system',
        description: 'Cutting-edge aeroponic system for maximum growth rates. High-pressure misting nozzles deliver nutrients directly to exposed roots in fine mist form. Results in 30-50% faster growth compared to traditional hydroponics. Includes misting chamber, high-pressure pump, timer, and 12 misting nozzles. Perfect for propagation and high-value crops.',
        shortDescription: 'High-tech aeroponic system with misting nozzles for explosive growth',
        price: '749.99',
        categoryId: 2,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/HydroToolProduct-AeroponicMistingSystem.png',
                altText: 'Aeroponic misting nozzles spraying plant roots'
            }
        ],
        inStock: true,
        stockQuantity: 3,
        sku: 'HY-AERO-001'
    },

    // Silvopasture Products
    {
        id: 16,
        name: 'Silvopasture Seed Mix',
        slug: 'silvopasture-seed-mix',
        description: 'Carefully curated blend of grasses and legumes specifically designed for silvopasture systems. Includes shade-tolerant varieties that thrive under tree canopy. Mix features perennial ryegrass, orchardgrass, white clover, and red clover. Provides excellent forage for livestock while improving soil health. Covers 1 acre. Includes planting guide with timing and establishment tips.',
        shortDescription: 'Premium forage seed blend for silvopasture grazing systems',
        price: '129.99',
        categoryId: 3,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-SilvopastureSeedMix.png',
                altText: 'Burlap sack of silvopasture seed mix'
            }
        ],
        inStock: true,
        stockQuantity: 28,
        sku: 'SP-SEED-001',
        featured: true
    },
    {
        id: 17,
        name: 'Tree Shelters & Protectors (25-pack)',
        slug: 'tree-shelters-protectors',
        description: 'Protect young trees from livestock browsing and weather damage with these durable tree shelters. Translucent design allows light penetration while creating a greenhouse effect for faster growth. Vented top prevents overheating. Includes stakes and ties for secure installation. Each shelter is 4 feet tall. Perfect for establishing fruit and nut trees in silvopasture systems.',
        shortDescription: 'Protective shelters for establishing young trees with livestock',
        price: '199.99',
        categoryId: 3,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-TreeShelters&Protectors.png',
                altText: 'Young trees in protective shelters with grazing animals'
            }
        ],
        inStock: true,
        stockQuantity: 16,
        sku: 'SP-SHELTER-001'
    },
    {
        id: 18,
        name: 'Chestnut Tree Seedlings (10-pack)',
        slug: 'chestnut-tree-seedlings',
        description: 'Premium bare-root chestnut tree seedlings perfect for silvopasture and agroforestry systems. Blight-resistant hybrid varieties selected for nut production and timber value. Trees provide valuable mast for livestock and wildlife while building long-term farm value. 2-3 feet tall, ready to plant. Includes variety tags and planting instructions.',
        shortDescription: 'Blight-resistant chestnut seedlings for silvopasture systems',
        price: '149.99',
        categoryId: 3,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-PermacultureStarterKit.png',
                altText: 'Bare-root chestnut tree seedlings'
            }
        ],
        inStock: true,
        stockQuantity: 12,
        sku: 'SP-TREE-CHESTNUT-001'
    },
    {
        id: 19,
        name: 'Forage Chicory Plants',
        slug: 'forage-chicory-plants',
        description: 'Deep-rooted perennial forage chicory plants that break up compacted soil while providing highly nutritious forage. Taproots can reach 6+ feet deep, bringing up minerals and improving soil structure. Livestock love the palatable leaves. Drought tolerant once established. Blue flowers provide pollinator habitat. 50 plants, enough for 1/4 acre.',
        shortDescription: 'Deep-rooted chicory for forage and soil improvement',
        price: '89.99',
        categoryId: 3,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-ForageChicoryPlants.png',
                altText: 'Chicory plants with blue flowers and deep taproots'
            }
        ],
        inStock: true,
        stockQuantity: 23,
        sku: 'SP-CHICORY-001'
    },
    {
        id: 20,
        name: 'Portable Electric Netting (164 feet)',
        slug: 'portable-electric-netting',
        description: 'Essential tool for rotational grazing in silvopasture systems. 164 feet of portable electric netting allows you to create temporary paddocks around trees. Includes energizer, ground rod, and step-in posts. Easy to move daily or weekly for intensive rotational grazing. Keeps chickens, sheep, or goats contained while protecting young trees. Solar energizer option available.',
        shortDescription: 'Portable electric fencing for rotational grazing management',
        price: '249.99',
        categoryId: 3,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-PortableElectricNettingforRotationalGrazing.png',
                altText: 'Electric netting set up in silvopasture with grazing animals'
            }
        ],
        inStock: true,
        stockQuantity: 19,
        sku: 'SP-FENCE-001'
    },
    {
        id: 21,
        name: 'Livestock Water Trough (100 gallon)',
        slug: 'livestock-water-trough',
        description: 'Durable galvanized steel stock tank perfect for silvopasture systems. 100-gallon capacity provides ample water for small herds. Rust-resistant coating ensures years of use. Ideal placement under tree shade keeps water cool in summer. Includes drain plug for easy cleaning. Can also be used for aquaculture integration in advanced silvopasture designs.',
        shortDescription: 'Galvanized stock tank for livestock water in silvopasture',
        price: '179.99',
        categoryId: 3,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-LivestockWaterTrough.png',
                altText: 'Stock tank under tree shade with animals drinking'
            }
        ],
        inStock: true,
        stockQuantity: 8,
        sku: 'SP-TROUGH-001'
    },
    {
        id: 22,
        name: 'Black Locust Tree Seeds',
        slug: 'black-locust-seeds',
        description: 'Fast-growing nitrogen-fixing tree seeds perfect for silvopasture and agroforestry. Black locust improves soil fertility, provides durable fence posts, and offers excellent bee forage. Grows 3-4 feet per year. Seeds are scarified and ready to plant. Includes detailed germination and establishment guide. 100 seeds per packet, enough for 1-2 acres.',
        shortDescription: 'Nitrogen-fixing tree seeds for soil improvement and timber',
        price: '34.99',
        categoryId: 3,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-Nitrogen-FixingTreeSeeds.png',
                altText: 'Black locust seed pods and seeds'
            }
        ],
        inStock: true,
        stockQuantity: 67,
        sku: 'SP-SEED-LOCUST-001'
    },

    // Kits & Collections
    {
        id: 23,
        name: 'Permaculture Starter Kit',
        slug: 'permaculture-starter-kit',
        description: 'Everything you need to start your permaculture journey in one beautiful package. Includes heirloom seed collection (20 varieties), hand tools (trowel, cultivator, pruners), soil testing kit, companion planting guide, and biodegradable pots. Packaged in a reusable wooden crate. Perfect gift for aspiring permaculture gardeners or anyone wanting to grow food sustainably.',
        shortDescription: 'Complete collection of tools, seeds, and guides for starting permaculture',
        price: '159.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-PermacultureStarterKit.png',
                altText: 'Wooden crate with permaculture tools and seeds'
            }
        ],
        inStock: true,
        stockQuantity: 42,
        sku: 'KIT-PERM-001',
        featured: true
    },
    {
        id: 24,
        name: 'Microgreens Growing Kit',
        slug: 'microgreens-growing-kit',
        description: 'Grow nutrient-dense microgreens in your kitchen year-round! Kit includes 3 stackable growing trays, organic seed mix (sunflower, pea shoots, radish, broccoli), growing medium, spray bottle, and detailed growing guide. Harvest fresh greens in just 7-14 days. Perfect for small spaces and beginners. Continuous harvest with succession planting.',
        shortDescription: 'Complete kit for growing fresh microgreens indoors',
        price: '49.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-MicrogreensGrowingKit.png',
                altText: 'Microgreens growing kit with trays and fresh greens'
            }
        ],
        inStock: true,
        stockQuantity: 87,
        sku: 'KIT-MICRO-001',
        featured: true
    },
    {
        id: 25,
        name: 'Mushroom Cultivation Kit',
        slug: 'mushroom-cultivation-kit',
        description: 'Grow gourmet oyster mushrooms at home with this easy-to-use kit. Pre-colonized substrate block ready to fruit - just mist and watch them grow! Produces 2-3 flushes of fresh mushrooms over 4-6 weeks. Includes humidity tent, spray bottle, and growing instructions. Educational and delicious. Makes a great gift or science project.',
        shortDescription: 'Ready-to-grow oyster mushroom kit for home cultivation',
        price: '34.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-MushroomCultivationKit.png',
                altText: 'Mushroom growing kit with fruiting oyster mushrooms'
            }
        ],
        inStock: true,
        stockQuantity: 56,
        sku: 'KIT-MUSHROOM-001'
    },
    {
        id: 26,
        name: 'Pollinator Garden Seed Collection',
        slug: 'pollinator-garden-seeds',
        description: 'Support bees, butterflies, and other pollinators with this curated seed collection. Includes 12 varieties of native wildflowers and herbs: milkweed, echinacea, bee balm, lavender, and more. All seeds are non-GMO and organically grown. Beautiful botanical illustration packets. Covers 100 square feet. Includes planting guide with bloom times for season-long nectar.',
        shortDescription: 'Native wildflower seeds for creating pollinator habitat',
        price: '39.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-PollinatorGardenSeedCollection.png',
                altText: 'Seed packets with botanical illustrations for pollinators'
            }
        ],
        inStock: true,
        stockQuantity: 124,
        sku: 'KIT-POLL-001'
    },
    {
        id: 27,
        name: 'Composting Starter Kit',
        slug: 'composting-starter-kit',
        description: 'Turn kitchen scraps into black gold with this complete composting kit. Includes 3-gallon countertop compost bin with charcoal filter (no odors!), compost thermometer, aerating tool, and comprehensive guide to hot and cold composting. Learn the perfect balance of browns and greens. Reduce waste while creating nutrient-rich soil amendment for your garden.',
        shortDescription: 'Complete kit for starting kitchen and garden composting',
        price: '69.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-CompostingStarterKit.png',
                altText: 'Countertop compost bin with composting tools'
            }
        ],
        inStock: true,
        stockQuantity: 73,
        sku: 'KIT-COMPOST-001'
    },
    {
        id: 28,
        name: 'Rainwater Harvesting Kit',
        slug: 'rainwater-harvesting-kit',
        description: 'Capture free water from your roof with this complete rainwater harvesting kit. Includes diverter valve, mesh filter, overflow valve, spigot, and flexible downspout connector. Fits standard downspouts and 55-gallon barrels (barrel not included). Easy DIY installation. Includes detailed instructions and water conservation guide. Reduce water bills and be prepared for droughts.',
        shortDescription: 'Complete components for harvesting rainwater from downspouts',
        price: '89.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-Rainwater Harvesting Kit Components.png',
                altText: 'Rainwater harvesting components laid out'
            }
        ],
        inStock: true,
        stockQuantity: 34,
        sku: 'KIT-RAIN-001'
    },
    {
        id: 29,
        name: 'Soil Building Amendment Kit',
        slug: 'soil-building-kit',
        description: 'Transform poor soil into thriving growing medium with this collection of premium amendments. Includes biochar for carbon sequestration, worm castings for biology, rock dust for minerals, kelp meal for trace elements, and bone meal for phosphorus. Each amendment comes in a reusable jar with detailed usage instructions. Enough to amend 100 square feet of garden beds.',
        shortDescription: 'Premium soil amendments for building healthy, living soil',
        price: '79.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-Soil Building Amendment Kit.png',
                altText: 'Jars of various soil amendments'
            }
        ],
        inStock: true,
        stockQuantity: 45,
        sku: 'KIT-SOIL-001'
    },
    {
        id: 30,
        name: 'Herb Spiral Garden Kit',
        slug: 'herb-spiral-kit',
        description: 'Create a beautiful and productive herb spiral with this complete kit. Includes illustrated guide with step-by-step instructions, 15 culinary herb seed packets, and planting diagram. Herb spirals are a permaculture staple, creating multiple microclimates in a small space. Grow Mediterranean herbs at the top and moisture-loving herbs at the bottom. Stones not included.',
        shortDescription: 'Guide and seeds for building a permaculture herb spiral',
        price: '44.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-Herb Spiral Garden Kit.png',
                altText: 'Herb spiral components and planting guide'
            }
        ],
        inStock: true,
        stockQuantity: 67,
        sku: 'KIT-HERB-001'
    },
    {
        id: 31,
        name: 'Worm Composting Kit',
        slug: 'worm-composting-kit',
        description: 'Turn kitchen scraps into premium vermicompost with this stackable worm bin system. Includes 3 working trays, collection tray for worm tea, and detailed guide. Compact design perfect for apartments and small spaces. Odorless when properly maintained. Add red wiggler worms (sold separately) and start producing the best fertilizer nature has to offer. Harvest finished compost from bottom tray.',
        shortDescription: 'Stackable worm bin system for apartment-friendly composting',
        price: '119.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-Worm Composting (Vermicompost) Kit.png',
                altText: 'Stackable worm composting bin with worms visible'
            }
        ],
        inStock: true,
        stockQuantity: 29,
        sku: 'KIT-WORM-001'
    },
    {
        id: 32,
        name: 'Beneficial Insect Habitat Kit',
        slug: 'beneficial-insect-kit',
        description: 'Attract and house beneficial insects for natural pest control. Kit includes mason bee house, ladybug habitat, butterfly puddling station, and native plant seeds for nectar. Reduce or eliminate pesticide use by supporting natural predators. Includes educational guide about beneficial insects and their role in the garden ecosystem. Great for kids and adults alike.',
        shortDescription: 'Create habitat for beneficial insects and natural pest control',
        price: '64.99',
        categoryId: 5,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/GeneralKits&Collections-Beneficial Insect Habitat Kit.png',
                altText: 'Bee hotel and beneficial insect habitats'
            }
        ],
        inStock: true,
        stockQuantity: 51,
        sku: 'KIT-INSECT-001'
    },

    // Plants & Seeds
    {
        id: 33,
        name: 'Heirloom Tomato Seeds Collection',
        slug: 'heirloom-tomato-seeds',
        description: 'Grow the most flavorful tomatoes with this heirloom variety collection. Includes 8 varieties: Brandywine, Cherokee Purple, Green Zebra, and more. All open-pollinated so you can save seeds. Non-GMO and organically grown. Each packet contains 25+ seeds with detailed growing instructions. Experience tomatoes the way they were meant to taste!',
        shortDescription: 'Collection of 8 heirloom tomato varieties for exceptional flavor',
        price: '29.99',
        categoryId: 6,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/PlantProduct-TOMATO.png',
                altText: 'Vibrant heirloom tomato on wooden table'
            }
        ],
        inStock: true,
        stockQuantity: 234,
        sku: 'SEED-TOMATO-001',
        featured: true
    },
    {
        id: 34,
        name: 'Medicinal Herb Garden Kit',
        slug: 'medicinal-herb-kit',
        description: 'Grow your own pharmacy with this collection of medicinal herbs. Includes live plants of lavender, chamomile, mint, echinacea, and lemon balm in biodegradable pots. All certified organic. Comes with herbal remedy guide covering teas, tinctures, and salves. Start your journey into herbalism with these easy-to-grow, powerful plants.',
        shortDescription: 'Live medicinal herb plants with herbal remedy guide',
        price: '54.99',
        categoryId: 6,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/PlantProduct-MED.png',
                altText: 'Medicinal herbs in biodegradable pots'
            }
        ],
        inStock: true,
        stockQuantity: 67,
        sku: 'PLANT-MED-001'
    },
    {
        id: 35,
        name: 'Artisan Seed Packet Collection',
        slug: 'artisan-seed-packets',
        description: 'Beautiful collection of 20 heirloom vegetable and flower seeds in artistically designed packets. Each packet features original botanical illustrations. Includes rare and unusual varieties you won\'t find at big box stores. All seeds are organic, non-GMO, and open-pollinated. Perfect gift for gardeners. Comes with vintage-inspired seed storage box.',
        shortDescription: 'Artistically packaged heirloom seeds in collectible storage box',
        price: '49.99',
        categoryId: 6,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/PlantProduct-SEED.png',
                altText: 'Artistic seed packets on linen cloth'
            }
        ],
        inStock: true,
        stockQuantity: 89,
        sku: 'SEED-COLL-001'
    },

    // Tools & Equipment
    {
        id: 36,
        name: 'Hand-Forged Garden Trowel',
        slug: 'hand-forged-trowel',
        description: 'Heirloom-quality garden trowel hand-forged by skilled craftspeople. Carbon steel blade holds an edge and won\'t bend. Comfortable hardwood handle shaped to fit your hand. This is a tool you\'ll use for decades and pass down to the next generation. Each trowel is unique with subtle variations from the forging process. Comes with leather sheath.',
        shortDescription: 'Heirloom-quality hand-forged trowel built to last generations',
        price: '89.99',
        categoryId: 7,
        images: [
            {
                url: '/src/lib/images/AI-MockAssets/ToolProduct-TROWL.png',
                altText: 'Hand-forged trowel on rich soil'
            }
        ],
        inStock: true,
        stockQuantity: 23,
        sku: 'TOOL-TROWEL-001',
        featured: true
    }
];

// Helper Functions

export function getMockProducts(options?: {
    categoryId?: number;
    search?: string;
    limit?: number;
    featured?: boolean;
}): MockProduct[] {
    let filtered = [...mockProducts];

    // Filter by category
    if (options?.categoryId) {
        filtered = filtered.filter((p) => p.categoryId === options.categoryId);
    }

    // Filter by featured
    if (options?.featured) {
        filtered = filtered.filter((p) => p.featured === true);
    }

    // Filter by search
    if (options?.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter(
            (p) =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.shortDescription.toLowerCase().includes(searchLower)
        );
    }

    // Apply limit
    if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
    }

    // Attach category info
    return filtered.map((product) => ({
        ...product,
        category: mockCategories.find((c) => c.id === product.categoryId)
    }));
}

export function getMockProductBySlug(slug: string): MockProduct | undefined {
    const product = mockProducts.find((p) => p.slug === slug);
    if (!product) return undefined;

    return {
        ...product,
        category: mockCategories.find((c) => c.id === product.categoryId)
    };
}

export function getMockCategories(): MockCategory[] {
    return [...mockCategories];
}

export function getMockCategoryBySlug(slug: string): MockCategory | undefined {
    return mockCategories.find((c) => c.slug === slug);
}

export function getMockProductsByCategory(categorySlug: string, limit?: number): MockProduct[] {
    const category = getMockCategoryBySlug(categorySlug);
    if (!category) return [];

    return getMockProducts({ categoryId: category.id, limit });
}
