import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import NavigationBar from "@/components/navigationBar";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
    <PromoBanner />
         <Navbar />
         <NavigationBar />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to our Privacy Policy. Your privacy is critically important to us. 
                  This Privacy Policy document contains types of information that is collected 
                  and recorded by our website and how we use it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect several different types of information for various purposes to 
                  provide and improve our service to you.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Personal identification information (Name, email address, phone number)</li>
                  <li>Delivery address and location information</li>
                  <li>Payment and billing information</li>
                  <li>Order history and preferences</li>
                  <li>Device and browser information</li>
                  <li>Cookies and usage data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the collected data for various purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>To provide and maintain our service</li>
                  <li>To process your orders and deliver products</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information to improve our service</li>
                  <li>To monitor the usage of our service</li>
                  <li>To detect, prevent and address technical issues</li>
                  <li>To send you promotional communications (with your consent)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The security of your data is important to us. We implement appropriate technical 
                  and organizational measures to protect your personal information against unauthorized 
                  or unlawful processing, accidental loss, destruction, or damage. However, no method 
                  of transmission over the Internet or method of electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our service 
                  and store certain information. You can instruct your browser to refuse all cookies 
                  or to indicate when a cookie is being sent. However, if you do not accept cookies, 
                  you may not be able to use some portions of our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may employ third-party companies and individuals to facilitate our service, 
                  provide the service on our behalf, perform service-related services, or assist us 
                  in analyzing how our service is used. These third parties have access to your 
                  personal data only to perform these tasks on our behalf and are obligated not to 
                  disclose or use it for any other purpose.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>The right to access, update, or delete your information</li>
                  <li>The right to rectification if your information is inaccurate</li>
                  <li>The right to object to our processing of your personal data</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any 
                  changes by posting the new Privacy Policy on this page and updating the "Last 
                  updated" date at the top of this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at 
                  privacy@freshgrocer.com or through our contact page.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
