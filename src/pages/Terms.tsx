import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import NavigationBar from "@/components/navigationBar";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
     <PromoBanner />
         <Navbar />
         <NavigationBar />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using our service, you agree to be bound by these Terms of Service 
                  and all applicable laws and regulations. If you do not agree with any of these terms, 
                  you are prohibited from using or accessing this site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Use License</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily access our service for personal, non-commercial 
                  use. This is the grant of a license, not a transfer of title, and under this license 
                  you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or public display</li>
                  <li>Attempt to reverse engineer any software contained on our service</li>
                  <li>Remove any copyright or proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or mirror on any server</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Account Registration</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To access certain features of our service, you may be required to register for an 
                  account. You agree to provide accurate, current, and complete information during the 
                  registration process and to update such information to keep it accurate, current, and 
                  complete. You are responsible for safeguarding your password and for all activities 
                  that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Orders and Payment</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you place an order through our service:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>All orders are subject to acceptance and availability</li>
                  <li>We reserve the right to refuse or cancel any order</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Payment must be received before order fulfillment</li>
                  <li>You are responsible for providing accurate delivery information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Delivery</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We make every effort to deliver products within the specified timeframe. However, 
                  delivery times are estimates and may vary due to circumstances beyond our control. 
                  We are not liable for delays in delivery. Fresh produce quality is time-sensitive; 
                  please ensure someone is available to receive the delivery.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Returns and Refunds</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Due to the perishable nature of our products, we have a strict return policy. 
                  If you receive damaged or unsatisfactory products, please contact us within 24 hours 
                  of delivery with photographic evidence. We will review each case individually and 
                  provide a refund or replacement as appropriate.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Product Quality</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We strive to provide the highest quality fresh produce. However, natural variations 
                  in size, color, and appearance are normal for fresh products. We do not guarantee 
                  exact match to product images, which are for illustrative purposes only.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">User Conduct</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Engage in fraudulent activities</li>
                  <li>Harass or harm other users</li>
                  <li>Interfere with the proper functioning of our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall we be liable for any damages (including, without limitation, 
                  damages for loss of data or profit, or due to business interruption) arising out 
                  of the use or inability to use our service, even if we have been notified of the 
                  possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms and conditions are governed by and construed in accordance with the 
                  laws of the jurisdiction in which we operate. You irrevocably submit to the 
                  exclusive jurisdiction of the courts in that location.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of 
                  any material changes by posting the new Terms of Service on this page and updating 
                  the "Last updated" date. Your continued use of the service after any such changes 
                  constitutes your acceptance of the new Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at 
                  legal@freshgrocer.com or through our contact page.
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

export default Terms;
