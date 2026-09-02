import { notFound } from "next/navigation";

interface PolicyPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { handle } = await params;
  
  const policies: { [key: string]: { title: string, body: string } } = {
    'privacy-policy': { 
      title: 'Privacy Policy', 
      body: `
        <p>At Unrwly, your privacy is our priority. This Privacy Policy details how we handle the minimal data required to provide a premium shopping experience.</p>
        <h3>1. Data Collection</h3>
        <p>We only collect data necessary for fulfillment: names, shipping addresses, and contact emails. We do not store credit card information on our servers; all transactions are processed securely via Stripe.</p>
        <h3>2. Third-Party Integration</h3>
        <p>To deliver your products, we share shipping details with our fulfillment partner, Printify. Both Stripe and Printify adhere to industry-leading data protection standards (GDPR and CCPA compliant).</p>
        <h3>3. Your Rights</h3>
        <p>You have the right to request a summary of the data we hold or its deletion at any time by contacting support.</p>
      ` 
    },
    'terms-of-service': { 
      title: 'Terms of Service', 
      body: `
        <p>Welcome to Unrwly. By accessing our platform, you agree to the following terms and conditions.</p>
        <h3>1. Production-on-Demand</h3>
        <p>Unrwly operates as a high-performance retail engine using production-on-demand fulfillment. Each piece is crafted specifically upon your order request.</p>
        <h3>2. Usage Rights</h3>
        <p>All content, designs, and intellectual property on this site are owned by Unrwly. Unauthorized duplication is strictly prohibited.</p>
        <h3>3. Limitation of Liability</h3>
        <p>Our liability is limited to the retail value of the products purchased. We are not responsible for indirect or consequential damages arising from the use of our services.</p>
      ` 
    },
    'shipping-policy': { 
      title: 'Shipping Policy', 
      body: `
        <p>Unrwly utilizes a decentralized fulfillment network to ensure global reach and production efficiency.</p>
        <h3>1. Logistics Lifecycle</h3>
        <p>Orders typically enter production within 24-48 hours. As each piece is production-on-demand, please allow for a manufacturing window prior to dispatch.</p>
        <h3>2. Delivery Estimates</h3>
        <p>Standard delivery times range from 7 to 14 business days depending on your global region. Tracking links are propagated to your account dashboard once a shipment is verified.</p>
        <h3>3. Carriers</h3>
        <p>We leverage the Printify network to select the most efficient carrier for your locale (UPS, USPS, DHL, etc).</p>
      ` 
    },
    'refund-policy': { 
      title: 'Refund Policy', 
      body: `
        <p>We stand by the quality of Unrwly essentials. If your acquisition doesn't meet the manifest, we provide a structured return path.</p>
        <h3>1. 30-Day Window</h3>
        <p>You have 30 days from the date of receipt to initiate a return. Items must be in their original, unworn, and unwashed condition with all tags attached.</p>
        <h3>2. Verification Process</h3>
        <p>Refunds are processed once the returned item undergoes quality verification at our intake center. We do not offer direct exchanges; please return the item for a refund and place a new order.</p>
        <h3>3. Support</h3>
        <p>Contact our support node for precise return instructions and shipping labels.</p>
      ` 
    }
  };

  const policy = policies[handle];

  if (!policy) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="type-h1 mb-12 text-white">
          {policy.title}
        </h1>
        <div 
          className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed
                     prose-headings:font-sans prose-headings:text-white prose-headings:mt-12 prose-headings:mb-6
                     prose-p:mb-6 prose-strong:text-white prose-a:text-white prose-a:underline underline-offset-4
                     hover:prose-a:text-gray-400 transition-colors"
          dangerouslySetInnerHTML={{ __html: policy.body }}
        />
      </div>
    </div>
  );
}
