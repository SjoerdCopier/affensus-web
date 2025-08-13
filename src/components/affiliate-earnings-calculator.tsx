'use client'

import { useState, Suspense } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { InfoIcon } from 'lucide-react'
import Breadcrumbs from "@/components/breadcrumbs"

function AffiliateEarningsCalculatorContent() {
  // Existing state
  const [pageviews, setPageviews] = useState(10000)
  const [ctr, setCtr] = useState(15)
  const [conversionRate, setConversionRate] = useState(8)
  const [commissionRate, setCommissionRate] = useState(4)
  const [averageOrderValue, setAverageOrderValue] = useState(100)

  // New advanced metrics state
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [costPerVisitor, setCostPerVisitor] = useState(0.1)
  const [returnVisitorRate, setReturnVisitorRate] = useState(20)
  const [averageLifetimeValue, setAverageLifetimeValue] = useState(500)

  const calculateEarnings = () => {
    const dailyEarnings = (pageviews * (ctr / 100) * (conversionRate / 100) * (commissionRate / 100) * averageOrderValue) / 30
    const monthlyCost = pageviews * costPerVisitor
    const monthlyProfit = (dailyEarnings * 30) - monthlyCost
    const roi = (monthlyProfit / monthlyCost) * 100

    return {
      daily: dailyEarnings,
      weekly: dailyEarnings * 7,
      monthly: dailyEarnings * 30,
      yearly: dailyEarnings * 365,
      monthlyCost: monthlyCost,
      monthlyProfit: monthlyProfit,
      roi: roi
    }
  }

  const earnings = calculateEarnings()

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-4 pb-16 space-y-12">
        {/* Breadcrumbs */}
        <div>
          <Breadcrumbs
            items={[
              {
                label: "Tools",
                href: "/tools",
              },
              {
                label: "Affiliate Earnings Calculator",
                href: "/tools/affiliate-earnings-calculator",
                current: true,
              },
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Affiliate Earnings Calculator
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Estimate your potential affiliate earnings based on your website's performance metrics.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card className={"bg-[#f5f7f4]"}>
                  <CardHeader>
                    <CardTitle>Input Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="pageviews">Monthly Pageviews</Label>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>The number of pageviews your website receives per month.</p>
                                <p className="pt-2">This metric is crucial for estimating your potential affiliate earnings as it represents your overall traffic.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="pageviews"
                          type="number"
                          className="mt-2"
                          value={pageviews === 0 ? '' : pageviews}
                          onChange={(e) => setPageviews(e.target.value === '' ? 0 : Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="ctr">Click-Through Rate (%)</Label>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>The percentage of visitors who click on your affiliate links.</p>
                                <p className="pt-2">A higher CTR indicates more effective placement and presentation of your affiliate links.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="ctr"
                          type="number"
                          className="mt-2"
                          value={ctr === 0 ? '' : ctr}
                          onChange={(e) => setCtr(e.target.value === '' ? 0 : Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="conversionRate">Conversion Rate (%)</Label>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>The percentage of visitors who make a purchase after clicking your affiliate link.</p>
                                <p className="pt-2">This rate reflects how well the products you're promoting match your audience's interests and needs.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="conversionRate"
                          type="number"
                          className="mt-2"
                          value={conversionRate === 0 ? '' : conversionRate}
                          onChange={(e) => setConversionRate(e.target.value === '' ? 0 : Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>The percentage of the sale value you earn as commission.</p>
                                <p className="pt-2">Higher commission rates directly increase your earnings per sale, but may vary depending on the affiliate program and product type.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="commissionRate"
                          type="number"
                          className="mt-2"
                          value={commissionRate === 0 ? '' : commissionRate}
                          onChange={(e) => setCommissionRate(e.target.value === '' ? 0 : Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="averageOrderValue">Average Order Value ($)</Label>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>The average value of orders made through your affiliate links.</p>
                                <p className="pt-2">Higher average order values can significantly boost your earnings, especially when combined with a good commission rate.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="averageOrderValue"
                          type="number"
                          className="mt-2"
                          value={averageOrderValue === 0 ? '' : averageOrderValue}
                          onChange={(e) => setAverageOrderValue(e.target.value === '' ? 0 : Number(e.target.value))}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="advanced-mode"
                          checked={showAdvanced}
                          onCheckedChange={setShowAdvanced}
                        />
                        <Label htmlFor="advanced-mode">Advanced Mode</Label>
                      </div>

                      {showAdvanced && (
                        <div className="space-y-4 mt-4 p-4 bg-gray-100 rounded-md">
                          <h4 className="font-semibold">Advanced Metrics</h4>

                          <div>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="costPerVisitor">Cost Per Visitor ($)</Label>
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[350px] font-normal">
                                    <p>The average cost to acquire a single visitor to your website.</p>
                                    <p className="pt-2">This helps calculate the ROI of your affiliate marketing efforts.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Input
                              id="costPerVisitor"
                              type="number"
                              className="mt-2"
                              value={costPerVisitor === 0 ? '' : costPerVisitor}
                              onChange={(e) => setCostPerVisitor(e.target.value === '' ? 0 : Number(e.target.value))}
                              step="0.01"
                            />
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="returnVisitorRate">Return Visitor Rate (%)</Label>
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[350px] font-normal">
                                    <p>The percentage of visitors who return to your site.</p>
                                    <p className="pt-2">A higher rate can indicate strong content and user engagement.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Input
                              id="returnVisitorRate"
                              type="number"
                              className="mt-2"
                              value={returnVisitorRate === 0 ? '' : returnVisitorRate}
                              onChange={(e) => setReturnVisitorRate(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="averageLifetimeValue">Average Customer Lifetime Value ($)</Label>
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[350px] font-normal">
                                    <p>The total revenue you expect to earn from a customer over their lifetime.</p>
                                    <p className="pt-2">This helps in understanding the long-term value of your affiliate efforts.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Input
                              id="averageLifetimeValue"
                              type="number"
                              className="mt-2"
                              value={averageLifetimeValue === 0 ? '' : averageLifetimeValue}
                              onChange={(e) => setAverageLifetimeValue(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Estimated Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Daily Earnings</Label>
                        <Input readOnly className="mt-2" value={`$${earnings.daily.toFixed(2)}`} />
                      </div>
                      <div>
                        <Label>Weekly Earnings</Label>
                        <Input readOnly className="mt-2" value={`$${earnings.weekly.toFixed(2)}`} />
                      </div>
                      <div>
                        <Label>Monthly Earnings</Label>
                        <Input readOnly className="mt-2" value={`$${earnings.monthly.toFixed(2)}`} />
                      </div>
                      <div>
                        <Label>Yearly Earnings</Label>
                        <Input readOnly className="mt-2" value={`$${earnings.yearly.toFixed(2)}`} />
                      </div>

                      {showAdvanced && (
                        <>
                          <div>
                            <Label>Monthly Cost</Label>
                            <Input readOnly className="mt-2" value={`$${earnings.monthlyCost.toFixed(2)}`} />
                          </div>
                          <div>
                            <Label>Monthly Profit</Label>
                            <Input readOnly className="mt-2" value={`$${earnings.monthlyProfit.toFixed(2)}`} />
                          </div>
                          <div>
                            <Label>ROI</Label>
                            <Input readOnly className="mt-2" value={`${earnings.roi.toFixed(2)}%`} />
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-700 leading-relaxed mb-4">The affiliate earnings calculator uses the following formula:</p>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <span style={{ color: "#E53E3E" }}>Earnings</span> =
                <span style={{ color: "#3182CE" }}> Pageviews </span> ×
                <span style={{ color: "#ECC94B" }}> CTR </span> ×
                <span style={{ color: "#48BB78" }}> Conversion Rate </span> ×
                <span style={{ color: "#4299E1" }}> Commission Rate </span> ×
                <span style={{ color: "#ED8936" }}> Average Order Value</span>
              </pre>
              <p className="mt-4 text-gray-700 leading-relaxed">This calculation provides an estimate of your potential earnings based on the input parameters. Keep in mind that actual results may vary due to factors such as seasonality, product popularity, and market conditions.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips to Increase Your Affiliate Earnings</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                <li>Improve your content quality to attract more visitors</li>
                <li>Optimize your CTR by using compelling call-to-action buttons and product images</li>
                <li>Choose high-converting products that align with your audience's interests</li>
                <li>Negotiate higher commission rates with your affiliate partners</li>
                <li>Focus on promoting products with higher average order values</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Negotiating Higher Commissions</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When approaching affiliate managers with a media kit, you might hear that they have no budget for branding or extra exposure packages. However, they often have the flexibility to offer increased commission rates.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Use the calculator above to demonstrate the potential increase in revenue from a higher commission rate. This data-driven approach can be a powerful negotiation tool.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                For example, if you currently earn a 4% commission and negotiate an increase to 6%:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 leading-relaxed">
                <li>At 4%: Monthly earnings of ${earnings.monthly.toFixed(2)}</li>
                <li>At 6%: Monthly earnings of ${(earnings.monthly * 1.5).toFixed(2)}</li>
                <li>Potential increase: ${(earnings.monthly * 0.5).toFixed(2)} per month</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                This significant increase in earnings can be a compelling argument for both you and the affiliate manager, as it incentivizes you to drive more sales without requiring additional budget allocation from their end.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AffiliateEarningsCalculator() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AffiliateEarningsCalculatorContent />
    </Suspense>
  )
}