import Link from 'next/link';
import { FaArrowLeft, FaGavel } from 'react-icons/fa';

export default function Terms() {
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
            <FaGavel className="w-16 h-16 text-primary/80" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">1.</span> Agreement to Terms
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                By accessing our website and services, you agree to be bound by these Terms of Service.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">2.</span> Use of Services
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Provide accurate information when creating an account</li>
                <li>Maintain the security of your account</li>
                <li>Use the services in compliance with applicable laws</li>
                <li>Not engage in any harmful or disruptive behavior</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">3.</span> Payment Terms
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                Payment for services is non-refundable unless otherwise specified. We reserve the right
                to modify our pricing with notice.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">4.</span> Content Guidelines
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">When posting on our forum, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Post only appropriate, relevant content</li>
                <li>Respect other users' privacy and rights</li>
                <li>Not post misleading or harmful information</li>
                <li>Not spam or post promotional content</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">5.</span> Intellectual Property
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                All content and materials on this site are protected by intellectual property rights
                and may not be used without permission.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">6.</span> Limitation of Liability
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                Our services are provided "as is" without warranties. We are not liable for any
                damages arising from use of our services.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary">7.</span> Changes to Terms
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Continued use of our services
                constitutes acceptance of updated terms.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mt-12">
            <div className="bg-primary/5 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                For questions about these terms,{' '}
                <Link
                  href="/contact?subject=Terms%20of%20Service%20Question"
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