import mongoose from 'mongoose';
import Blog from '../src/models/Blog';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate';

const sampleBlogs = [
  {
    title: 'Top 10 Real Estate Investment Tips for 2026',
    slug: 'top-10-real-estate-investment-tips-2026',
    featuredImage: '/uploads/blog-investment-tips.jpg',
    shortDescription: 'Discover the most effective strategies for real estate investment in 2026. Learn from industry experts about market trends and profitable opportunities.',
    content: `
      <h2>Introduction</h2>
      <p>Real estate investment continues to be one of the most reliable ways to build wealth. Here are our top 10 tips for success in 2026.</p>
      
      <h3>1. Research Market Trends</h3>
      <p>Understanding local and national market trends is crucial for making informed investment decisions. Stay updated with market reports and economic indicators.</p>
      
      <h3>2. Location is Key</h3>
      <p>The location of a property significantly impacts its value and rental potential. Focus on areas with good infrastructure, connectivity, and growth prospects.</p>
      
      <h3>3. Calculate ROI Carefully</h3>
      <p>Before investing, calculate your potential return on investment including rental income, appreciation, and tax benefits.</p>
      
      <p>Continue reading to discover the remaining 7 essential tips for successful real estate investment...</p>
    `,
    author: 'Sarah Johnson',
    category: 'Investment',
    tags: ['investment', 'tips', 'market trends', 'ROI'],
    publishDate: new Date('2026-06-01'),
    seoMetaTitle: 'Real Estate Investment Tips 2026 | Expert Advice',
    seoMetaDescription: 'Learn the top 10 real estate investment strategies for 2026 from industry experts. Maximize your ROI with proven tips and market insights.',
    status: 'published',
    isActive: true,
  },
  {
    title: 'Understanding Property Valuation Methods',
    slug: 'understanding-property-valuation-methods',
    featuredImage: '/uploads/blog-valuation.jpg',
    shortDescription: 'A comprehensive guide to different property valuation methods used by professionals to determine accurate market value of real estate.',
    content: `
      <h2>What is Property Valuation?</h2>
      <p>Property valuation is the process of determining the economic value of a real estate asset. It's essential for buying, selling, taxation, and investment purposes.</p>
      
      <h3>Common Valuation Methods</h3>
      <ul>
        <li><strong>Comparative Market Analysis (CMA)</strong> - Comparing similar properties in the area</li>
        <li><strong>Income Approach</strong> - Based on potential rental income</li>
        <li><strong>Cost Approach</strong> - Calculating replacement cost minus depreciation</li>
      </ul>
      
      <h3>Factors Affecting Property Value</h3>
      <p>Location, size, condition, amenities, market conditions, and economic factors all play crucial roles in property valuation.</p>
    `,
    author: 'Michael Chen',
    category: 'Education',
    tags: ['valuation', 'property value', 'real estate basics'],
    publishDate: new Date('2026-05-25'),
    seoMetaTitle: 'Property Valuation Methods Explained | Real Estate Guide',
    seoMetaDescription: 'Comprehensive guide to property valuation methods including CMA, income approach, and cost approach. Learn how professionals value real estate.',
    status: 'published',
    isActive: true,
  },
  {
    title: 'The Future of Smart Homes in Real Estate',
    slug: 'future-of-smart-homes-real-estate',
    featuredImage: '/uploads/blog-smart-homes.jpg',
    shortDescription: 'Explore how smart home technology is revolutionizing the real estate market and what it means for property values and buyer preferences.',
    content: `
      <h2>Smart Homes: The New Standard</h2>
      <p>Smart home technology is no longer a luxury—it's becoming an expected feature in modern real estate. From automated lighting to AI-powered security systems, technology is transforming how we live.</p>
      
      <h3>Popular Smart Home Features</h3>
      <ul>
        <li>Voice-controlled lighting and climate systems</li>
        <li>Smart security cameras and locks</li>
        <li>Energy management systems</li>
        <li>Automated blinds and curtains</li>
        <li>Smart appliances</li>
      </ul>
      
      <h3>Impact on Property Values</h3>
      <p>Properties with integrated smart home systems are seeing increased valuations and faster sales. Buyers are willing to pay premium prices for move-in-ready smart homes.</p>
    `,
    author: 'Emily Rodriguez',
    category: 'Technology',
    tags: ['smart homes', 'technology', 'innovation', 'property value'],
    publishDate: new Date('2026-05-20'),
    seoMetaTitle: 'Smart Homes & Real Estate Future | Tech Trends',
    seoMetaDescription: 'Discover how smart home technology is impacting real estate values and buyer preferences. The future of residential properties is here.',
    status: 'published',
    isActive: true,
  },
  {
    title: 'First-Time Home Buyer\'s Complete Guide',
    slug: 'first-time-home-buyers-complete-guide',
    featuredImage: '/uploads/blog-first-time-buyer.jpg',
    shortDescription: 'Everything first-time home buyers need to know—from getting pre-approved to closing the deal. A step-by-step guide to your first property purchase.',
    content: `
      <h2>Your Journey to Homeownership</h2>
      <p>Buying your first home is an exciting milestone. This guide will walk you through every step of the process.</p>
      
      <h3>Step 1: Get Pre-Approved</h3>
      <p>Before house hunting, get pre-approved for a mortgage to understand your budget and show sellers you're a serious buyer.</p>
      
      <h3>Step 2: Find the Right Property</h3>
      <p>Work with a real estate agent to find properties that match your needs, budget, and preferred location.</p>
      
      <h3>Step 3: Make an Offer</h3>
      <p>Your agent will help you prepare a competitive offer based on market analysis and property condition.</p>
      
      <p>Continue through inspection, financing, and closing to complete your purchase...</p>
    `,
    author: 'David Thompson',
    category: 'Buyer\'s Guide',
    tags: ['first-time buyer', 'home buying', 'mortgage', 'guide'],
    publishDate: new Date('2026-05-15'),
    seoMetaTitle: 'First-Time Home Buyer Guide 2026 | Step-by-Step Process',
    seoMetaDescription: 'Complete guide for first-time home buyers. Learn about pre-approval, house hunting, making offers, and closing. Your path to homeownership starts here.',
    status: 'published',
    isActive: true,
  },
  {
    title: 'Sustainable Architecture in Modern Real Estate',
    slug: 'sustainable-architecture-modern-real-estate',
    featuredImage: '/uploads/blog-sustainable.jpg',
    shortDescription: 'How sustainable architecture is shaping the future of real estate development with eco-friendly materials and energy-efficient designs.',
    content: `
      <h2>Building a Greener Future</h2>
      <p>Sustainable architecture is transforming real estate development, focusing on environmental responsibility and energy efficiency.</p>
      
      <h3>Key Features of Sustainable Buildings</h3>
      <ul>
        <li>Solar panels and renewable energy systems</li>
        <li>Rainwater harvesting</li>
        <li>Natural ventilation and lighting</li>
        <li>Recycled and eco-friendly materials</li>
        <li>Green roofs and vertical gardens</li>
      </ul>
      
      <h3>Benefits for Homeowners</h3>
      <p>Lower utility bills, reduced carbon footprint, healthier living environment, and increased property value are just some of the benefits.</p>
    `,
    author: 'Lisa Kumar',
    category: 'Sustainability',
    tags: ['sustainability', 'green building', 'eco-friendly', 'architecture'],
    publishDate: new Date('2026-05-10'),
    seoMetaTitle: 'Sustainable Architecture in Real Estate | Green Building',
    seoMetaDescription: 'Explore how sustainable architecture is revolutionizing real estate with eco-friendly designs, renewable energy, and green building practices.',
    status: 'published',
    isActive: true,
  },
  {
    title: 'Commercial Real Estate Market Analysis Q2 2026',
    slug: 'commercial-real-estate-market-analysis-q2-2026',
    featuredImage: '/uploads/blog-commercial.jpg',
    shortDescription: 'In-depth analysis of the commercial real estate market in Q2 2026, including trends, opportunities, and expert predictions for the coming quarters.',
    content: `
      <h2>Q2 2026 Market Overview</h2>
      <p>The commercial real estate market shows strong recovery with increased demand across office, retail, and industrial sectors.</p>
      
      <h3>Key Trends</h3>
      <ul>
        <li>Hybrid work models affecting office space demand</li>
        <li>E-commerce driving warehouse demand</li>
        <li>Mixed-use developments gaining popularity</li>
        <li>Technology integration in commercial spaces</li>
      </ul>
      
      <h3>Investment Opportunities</h3>
      <p>Industrial and logistics properties continue to offer strong returns, while retail spaces in prime locations show promising recovery.</p>
    `,
    author: 'Robert Martinez',
    category: 'Market Analysis',
    tags: ['commercial real estate', 'market analysis', 'trends', 'investment'],
    publishDate: new Date('2026-05-05'),
    seoMetaTitle: 'Commercial Real Estate Market Analysis Q2 2026',
    seoMetaDescription: 'Comprehensive Q2 2026 commercial real estate market analysis. Trends, opportunities, and expert insights for investors and developers.',
    status: 'draft',
    isActive: true,
  },
];

async function seedBlogs() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing blogs...');
    await Blog.deleteMany({});
    console.log('✅ Cleared existing blogs');

    console.log('🌱 Seeding sample blogs...');
    const blogs = await Blog.insertMany(sampleBlogs);
    console.log(`✅ Successfully seeded ${blogs.length} blogs`);

    console.log('\n📊 Summary:');
    console.log(`   - Total blogs: ${blogs.length}`);
    console.log(`   - Published: ${blogs.filter(b => b.status === 'published').length}`);
    console.log(`   - Drafts: ${blogs.filter(b => b.status === 'draft').length}`);

    console.log('\n📝 Sample blog slugs:');
    blogs.forEach(blog => {
      console.log(`   - ${blog.slug} (${blog.status})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database disconnected. Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedBlogs();
