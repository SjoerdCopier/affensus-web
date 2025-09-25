"use client"

import React from 'react';
import Link from 'next/link';
import Breadcrumbs from "@/components/breadcrumbs";
import { Shield, Eye, TrendingUp, AlertTriangle, CheckCircle, Users, DollarSign, Link2, ArrowRight } from 'lucide-react';

export default function FraudProtection() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-4 pb-16 space-y-12">
        {/* Breadcrumbs */}
        <div>
          <Breadcrumbs
            items={[
              {
                label: "Services",
                href: "/services",
              },
              {
                label: "Fraud Protection",
                href: "/services/fraud-protection",
                current: true,
              },
            ]}
          />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Link Transparency
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Complete visibility into your affiliate traffic flow - from first click to final conversion
            </p>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 my-12">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-[#6ca979]">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Full Visibility</h3>
                <p className="text-sm text-gray-600">See every redirect and hop in your affiliate links</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-[#6ca979]">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Revenue Protection</h3>
                <p className="text-sm text-gray-600">Prevent commission leakage to unauthorized networks</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-[#6ca979]">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Performance Insights</h3>
                <p className="text-sm text-gray-600">Understand true traffic sources and attribution</p>
              </div>
            </div>
          </div>

          {/* The Issue Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Issue</h2>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              In affiliate marketing, clicks often pass through subnetworks and tracking links before reaching the advertiser&apos;s site. For both networks and advertisers, this creates a blind spot:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <p className="text-gray-700">
                  <span className="font-semibold">Networks</span> may lose attribution if a subnetwork quietly redirects traffic to a competing platform.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <p className="text-gray-700">
                  <span className="font-semibold">Advertisers</span> may pay commission to the wrong party, or not know which partners actually drove the sale.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600 text-sm italic">
                This isn&apos;t always deliberate fraud — sometimes it&apos;s simply how subnetworks manage campaigns or route traffic through their own systems. But the lack of visibility makes it hard to measure true performance and compliance.
              </p>
            </div>
          </div>

          {/* Why It Matters Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* For Networks */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-[#6ca979]">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Networks</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#6ca979] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Protect your revenue streams</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#6ca979] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Ensure partners are credited fairly</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#6ca979] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Maintain network integrity</p>
                </div>
              </div>
            </div>

            {/* For Advertisers */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-600">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Advertisers</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Safeguard marketing budgets</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Maintain partner trust</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Understand true traffic sources</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why It Matters - Everyone */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gray-600">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">For Everyone</h3>
            </div>
            <p className="text-gray-700">
              Build transparency into affiliate relationships and reduce &ldquo;leakage&rdquo; of clicks to unintended destinations. Create a more trustworthy and efficient affiliate ecosystem for all participants.
            </p>
          </div>

          {/* How It Works Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-2 rounded-lg bg-[#6ca979]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Link Transparency scans affiliate links across subnetworks and records the full redirect chain:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#6ca979] text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900">Starting Point</h4>
                  <p className="text-gray-600 text-sm">Original affiliate link from your campaign</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#6ca979] text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900">Every Hop</h4>
                  <p className="text-gray-600 text-sm">Subnetwork IDs, redirects, and tracking pixels</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#6ca979] text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900">Final Destination</h4>
                  <p className="text-gray-600 text-sm">Landing page and network receiving attribution</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-gray-700">
                This allows networks and advertisers to see exactly where traffic flows, spot unexpected diversions, and take action where necessary.
              </p>
            </div>
            
            {/* Try It Now CTA */}
            <div className="mt-6 p-4 bg-[#6ca979]/10 border border-[#6ca979] rounded-lg text-center">
              <p className="text-gray-700 mb-3">
                Want to see the redirect chain of your affiliate links right now?
              </p>
              <Link 
                href="/tools/affiliate-link-checker"
                className="inline-flex items-center space-x-2 bg-[#6ca979] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#5a8a66] transition-colors"
              >
                <Shield className="h-5 w-5" />
                <span>Check an Affiliate Link</span>
              </Link>
              <p className="text-sm text-gray-600 mt-2">
                See the hops between networks instantly with our free tool
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Real-Time Monitoring</h3>
                  <p className="text-gray-600 text-sm">
                    Track link redirects as they happen, with instant alerts for suspicious patterns or unauthorized diversions.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Comprehensive Reporting</h3>
                  <p className="text-gray-600 text-sm">
                    Detailed analytics on redirect chains, network attribution, and traffic flow patterns across all campaigns.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Automated Detection</h3>
                  <p className="text-gray-600 text-sm">
                    AI-powered analysis identifies potential fraud patterns and unexpected redirect behaviors automatically.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Partner Compliance</h3>
                  <p className="text-gray-600 text-sm">
                    Ensure all partners follow agreed-upon traffic routing and maintain transparency standards.
                  </p>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-r from-[#6ca979] to-green-600 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to Protect Your Affiliate Revenue?
              </h2>
              <p className="text-white/90 mb-6">
                Get complete visibility into your affiliate traffic flow and prevent commission leakage today.
              </p>
              <div className="flex justify-center">
                <a 
                  href="mailto:info@affensus.com?subject=Link%20Transparency%20Inquiry"
                  className="bg-white text-[#6ca979] px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors inline-block"
                >
                  Reach Out Today
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}