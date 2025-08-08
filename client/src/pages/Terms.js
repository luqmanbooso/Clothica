import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Terms = () => {
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
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                <p className="text-gray-600">Last updated: January 15, 2024</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using Clothica's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on Clothica's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on Clothica's website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Account</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account, whether or not you have authorized such activities or actions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Product Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We strive to display accurate product information, including prices, descriptions, and availability. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                If a product offered by Clothica is not as described, your sole remedy is to contact us for a refund or exchange.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment and Billing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By providing a credit card or other payment method, you represent and warrant that you are authorized to use the payment method you provide. You authorize us to charge your payment method for the total amount of your order.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                All prices are in USD and are subject to change without notice. Sales tax will be added to orders as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Shipping and Returns</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer various shipping options with different delivery times and costs. Shipping costs and delivery times are estimates and may vary based on your location and the shipping method selected.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Returns must be initiated within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with all tags attached. Return shipping costs are the responsibility of the customer unless the item is defective or incorrect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Clothica and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In no event shall Clothica, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@clothica.com<br />
                  <strong>Phone:</strong> +1 (555) 123-4567<br />
                  <strong>Address:</strong> 123 Fashion Street, Style City, SC 12345
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              By using our services, you agree to these terms. If you have any questions, please{' '}
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

export default Terms;
