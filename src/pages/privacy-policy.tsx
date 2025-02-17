import Link from 'next/link';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-16">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-12">
        <Link href="/" className="text-gray-600 hover:text-primary flex items-center gap-2 transition-colors">
          <FaArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <FaShieldAlt className="w-16 h-16 text-primary/80" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">1.</span> Information Collection
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">We collect information when you:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Create an account or update your profile</li>
                <li>Post questions or replies in our forum</li>
                <li>Make payments for consultations or services</li>
                <li>Contact us for support or information</li>
                <li>Sign up for our newsletter or updates</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">2.</span> Types of Information
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">The information we collect may include:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Name and contact information</li>
                <li>Account credentials</li>
                <li>Payment information</li>
                <li>Forum posts and replies</li>
                <li>Communication preferences</li>
                <li>Technical data about your device and usage</li>
              </ul>
            </div>
          </section>

          {/* Continue the pattern for other sections */}
          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">3.</span> Use of Information
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Provide and improve our services</li>
                <li>Process your payments and transactions</li>
                <li>Send you important updates and notifications</li>
                <li>Respond to your questions and comments</li>
                <li>Protect against misuse of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing and Advertising Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">4.</span> Data Sharing and Advertising
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">We want to be clear about our data practices:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>We do not sell your personal information to third parties</li>
                <li>We do not display advertisements on our platform</li>
                <li>We do not track users for advertising purposes</li>
                <li>We do not share your data with marketing companies</li>
              </ul>
              <p className="text-gray-700 mt-4">
                The only data sharing we conduct is essential for providing our services, such as:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Payment processing through secure payment providers</li>
                <li>Basic analytics to improve website performance</li>
                <li>Cloud hosting services to store your data securely</li>
              </ul>
            </div>
          </section>

          {/* Cookies Section */}
          <section id="cookies">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">5.</span> Use of Cookies
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">We use cookies and similar technologies for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Essential website functionality</li>
                <li>Authentication and security</li>
                <li>User preferences and settings</li>
                <li>Analytics and performance monitoring</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can control cookie preferences through your browser settings and our cookie consent manager.
              </p>
            </div>
          </section>

          {/* GDPR Rights Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">6.</span> Your GDPR Rights
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">Under GDPR, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Right to access your personal data (available in your account settings)</li>
                <li>Right to rectification of inaccurate data (manageable via account settings)</li>
                <li>Right to erasure - delete your account and data (available in account settings)</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability (download your data from account settings)</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Most of these rights can be exercised directly through your{' '}
                <Link href="/account/settings" className="text-primary hover:text-primary-dark">
                  account settings
                </Link>. For additional requests, please use our contact form. We will respond within 30 days.
              </p>
            </div>
          </section>

          {/* Data Transfers Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">7.</span> International Data Transfers
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                Your data may be processed in countries outside the European Economic Area (EEA).
                We ensure appropriate safeguards are in place through standard contractual clauses
                and adequate data protection measures.
              </p>
            </div>
          </section>

          {/* State Privacy Rights Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">8.</span> State Privacy Rights
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">Depending on your state of residence, you may have specific privacy rights:</p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">California (CCPA)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                <li>Right to know what personal information we collect and how it is used</li>
                <li>Right to delete your personal information</li>
                <li>Right to opt-out of personal information sales (we do not sell personal information)</li>
                <li>Right to non-discrimination</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Virginia (VCDPA)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                <li>Right to access and confirm personal data</li>
                <li>Right to correct inaccuracies</li>
                <li>Right to data portability</li>
                <li>Right to opt out of targeted advertising (we do not conduct targeted advertising)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Colorado (CPA)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                <li>Right to access, correct, or delete personal data</li>
                <li>Right to data portability</li>
                <li>Right to opt out of data processing</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Connecticut (CTDPA)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                <li>Right to access, correct, delete, or port personal data</li>
                <li>Right to opt out of targeted advertising and profiling</li>
                <li>Right to appeal denied requests</li>
              </ul>

              {/* Additional state sections to add */}
              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Utah (UCPA)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                <li>Right to access and delete personal data</li>
                <li>Right to data portability</li>
                <li>Right to opt out of targeted advertising and sales of personal data</li>
                <li>Right to non-discrimination for exercising these rights</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Montana (MCPA)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                <li>Right to access, correct, delete, and obtain a copy of personal data</li>
                <li>Right to opt out of targeted advertising and data sales</li>
                <li>Right to appeal a business's denial of requests</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Iowa (ICDPA)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                <li>Right to confirm processing and access personal data</li>
                <li>Right to delete personal data</li>
                <li>Right to data portability</li>
                <li>Right to opt out of targeted advertising and data sales</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Delaware (DPDPA)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                <li>Right to confirm whether a controller is processing personal data</li>
                <li>Right to access, correct, delete, and obtain a copy of personal data</li>
                <li>Right to opt out of targeted advertising and data sales</li>
                <li>Right to appeal denied consumer requests</li>
              </ul>

              <p className="text-gray-700 mt-6">
                Most of these rights can be exercised through your{' '}
                <Link href="/account/settings" className="text-primary hover:text-primary-dark">
                  account settings
                </Link>. For state-specific requests or additional information, please contact us through our{' '}
                <Link href="/contact" className="text-primary hover:text-primary-dark">
                  secure form
                </Link>.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mt-12">
            <div className="bg-primary/5 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                For privacy-related questions or concerns,{' '}
                <Link
                  href="/contact?subject=Privacy%20Policy%20Question"
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  please contact us through our secure form
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
