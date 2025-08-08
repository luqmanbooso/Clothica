import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <LockClosedIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-600">Last updated: January 15, 2024</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Name and contact information (email, phone, address)</li>
                    <li>Payment information (processed securely by our payment partners)</li>
                    <li>Account credentials and preferences</li>
                    <li>Order history and purchase behavior</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage data (pages visited, time spent, interactions)</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Location data (with your consent)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send order confirmations, shipping updates, and account notifications</li>
                <li>Personalize your shopping experience and recommend products</li>
                <li>Improve our website functionality and user experience</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Service Providers</h3>
                  <p className="text-gray-700">
                    We work with trusted third-party service providers who assist us in operating our website, processing payments, shipping orders, and providing customer support.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Legal Requirements</h3>
                  <p className="text-gray-700">
                    We may disclose your information if required by law or to protect our rights, property, or safety, or that of our users or the public.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Business Transfers</h3>
                  <p className="text-gray-700">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Security Measures Include:</h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4">
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure payment processing through PCI-compliant partners</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Types of Cookies We Use:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                    <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our site</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                    <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                  </ul>
                </div>
                <p className="text-gray-700">
                  You can control cookie settings through your browser preferences. However, disabling certain cookies may affect site functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for processing based on consent</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Retention Periods:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Account information: Until account deletion or 7 years after last activity</li>
                  <li>Order information: 7 years for tax and legal compliance</li>
                  <li>Marketing communications: Until you unsubscribe</li>
                  <li>Website analytics: 2 years</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Transfers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@clothica.com<br />
                  <strong>Phone:</strong> +1 (555) 123-4567<br />
                  <strong>Address:</strong> 123 Fashion Street, Style City, SC 12345<br />
                  <strong>Data Protection Officer:</strong> dpo@clothica.com
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Your privacy is important to us. If you have any questions about this policy, please{' '}
              <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                contact us
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
