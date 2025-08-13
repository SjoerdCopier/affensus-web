'use client'

import { useState, Suspense } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { InfoIcon } from 'lucide-react'
import Breadcrumbs from "@/components/breadcrumbs"
import { useLocaleTranslations } from "@/hooks/use-locale-translations"

function AffiliateEarningsCalculatorContent() {
  const { t } = useLocaleTranslations();
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
              {t('tools.affiliateEarningsCalculator.title')}
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('tools.affiliateEarningsCalculator.description')}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card className={"bg-[#f5f7f4]"}>
                  <CardHeader>
                    <CardTitle>{t('tools.affiliateEarningsCalculator.inputParameters')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="pageviews">{t('tools.affiliateEarningsCalculator.form.monthlyPageviews')}</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>{t('tools.affiliateEarningsCalculator.tooltips.pageviews.title')}</p>
                                <p className="pt-2">{t('tools.affiliateEarningsCalculator.tooltips.pageviews.description')}</p>
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
                          <Label htmlFor="ctr">{t('tools.affiliateEarningsCalculator.form.clickThroughRate')}</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>{t('tools.affiliateEarningsCalculator.tooltips.ctr.title')}</p>
                                <p className="pt-2">{t('tools.affiliateEarningsCalculator.tooltips.ctr.description')}</p>
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
                          <Label htmlFor="conversionRate">{t('tools.affiliateEarningsCalculator.form.conversionRate')}</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>{t('tools.affiliateEarningsCalculator.tooltips.conversionRate.title')}</p>
                                <p className="pt-2">{t('tools.affiliateEarningsCalculator.tooltips.conversionRate.description')}</p>
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
                          <Label htmlFor="commissionRate">{t('tools.affiliateEarningsCalculator.form.commissionRate')}</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>{t('tools.affiliateEarningsCalculator.tooltips.commissionRate.title')}</p>
                                <p className="pt-2">{t('tools.affiliateEarningsCalculator.tooltips.commissionRate.description')}</p>
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
                          <Label htmlFor="averageOrderValue">{t('tools.affiliateEarningsCalculator.form.averageOrderValue')}</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>{t('tools.affiliateEarningsCalculator.tooltips.averageOrderValue.title')}</p>
                                <p className="pt-2">{t('tools.affiliateEarningsCalculator.tooltips.averageOrderValue.description')}</p>
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
                        <Label htmlFor="advanced-mode">{t('tools.affiliateEarningsCalculator.advancedMode')}</Label>
                      </div>

                      {showAdvanced && (
                        <div className="space-y-4 mt-4 p-4 bg-gray-100 rounded-md">
                          <h4 className="font-semibold">{t('tools.affiliateEarningsCalculator.advancedMetrics')}</h4>

                          <div>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="costPerVisitor">{t('tools.affiliateEarningsCalculator.form.costPerVisitor')}</Label>
                                                        <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[350px] font-normal">
                                <p>{t('tools.affiliateEarningsCalculator.tooltips.costPerVisitor.title')}</p>
                                <p className="pt-2">{t('tools.affiliateEarningsCalculator.tooltips.costPerVisitor.description')}</p>
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
                              <Label htmlFor="returnVisitorRate">{t('tools.affiliateEarningsCalculator.form.returnVisitorRate')}</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[350px] font-normal">
                                    <p>{t('tools.affiliateEarningsCalculator.tooltips.returnVisitorRate.title')}</p>
                                    <p className="pt-2">{t('tools.affiliateEarningsCalculator.tooltips.returnVisitorRate.description')}</p>
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
                              <Label htmlFor="averageLifetimeValue">{t('tools.affiliateEarningsCalculator.form.averageLifetimeValue')}</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[350px] font-normal">
                                    <p>{t('tools.affiliateEarningsCalculator.tooltips.averageLifetimeValue.title')}</p>
                                    <p className="pt-2">{t('tools.affiliateEarningsCalculator.tooltips.averageLifetimeValue.description')}</p>
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
                    <CardTitle>{t('tools.affiliateEarningsCalculator.estimatedEarnings')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>{t('tools.affiliateEarningsCalculator.results.dailyEarnings')}</Label>
                        <Input readOnly className="mt-2" value={`$${earnings.daily.toFixed(2)}`} />
                      </div>
                      <div>
                        <Label>{t('tools.affiliateEarningsCalculator.results.weeklyEarnings')}</Label>
                        <Input readOnly className="mt-2" value={`$${earnings.weekly.toFixed(2)}`} />
                      </div>
                      <div>
                        <Label>{t('tools.affiliateEarningsCalculator.results.monthlyEarnings')}</Label>
                        <Input readOnly className="mt-2" value={`$${earnings.monthly.toFixed(2)}`} />
                      </div>
                      <div>
                        <Label>{t('tools.affiliateEarningsCalculator.results.yearlyEarnings')}</Label>
                        <Input readOnly className="mt-2" value={`$${earnings.yearly.toFixed(2)}`} />
                      </div>

                      {showAdvanced && (
                        <>
                          <div>
                            <Label>{t('tools.affiliateEarningsCalculator.results.monthlyCost')}</Label>
                            <Input readOnly className="mt-2" value={`$${earnings.monthlyCost.toFixed(2)}`} />
                          </div>
                          <div>
                            <Label>{t('tools.affiliateEarningsCalculator.results.monthlyProfit')}</Label>
                            <Input readOnly className="mt-2" value={`$${earnings.monthlyProfit.toFixed(2)}`} />
                          </div>
                          <div>
                            <Label>{t('tools.affiliateEarningsCalculator.results.roi')}</Label>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.affiliateEarningsCalculator.sections.howItWorks.title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t('tools.affiliateEarningsCalculator.sections.howItWorks.description')}</p>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <span style={{ color: "#E53E3E" }}>Earnings</span> =
                <span style={{ color: "#3182CE" }}> Pageviews </span> ×
                <span style={{ color: "#ECC94B" }}> CTR </span> ×
                <span style={{ color: "#48BB78" }}> Conversion Rate </span> ×
                <span style={{ color: "#4299E1" }}> Commission Rate </span> ×
                <span style={{ color: "#ED8936" }}> Average Order Value</span>
              </pre>
              <p className="mt-4 text-gray-700 leading-relaxed">{t('tools.affiliateEarningsCalculator.sections.howItWorks.explanation')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.affiliateEarningsCalculator.sections.tips.title')}</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                <li>{t('tools.affiliateEarningsCalculator.sections.tips.items.0')}</li>
                <li>{t('tools.affiliateEarningsCalculator.sections.tips.items.1')}</li>
                <li>{t('tools.affiliateEarningsCalculator.sections.tips.items.2')}</li>
                <li>{t('tools.affiliateEarningsCalculator.sections.tips.items.3')}</li>
                <li>{t('tools.affiliateEarningsCalculator.sections.tips.items.4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tools.affiliateEarningsCalculator.sections.negotiating.title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('tools.affiliateEarningsCalculator.sections.negotiating.paragraph1')}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('tools.affiliateEarningsCalculator.sections.negotiating.paragraph2')}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('tools.affiliateEarningsCalculator.sections.negotiating.paragraph3')}
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 leading-relaxed">
                <li>{t('tools.affiliateEarningsCalculator.sections.negotiating.example.at4').replace('{amount}', earnings.monthly.toFixed(2))}</li>
                <li>{t('tools.affiliateEarningsCalculator.sections.negotiating.example.at6').replace('{amount}', (earnings.monthly * 1.5).toFixed(2))}</li>
                <li>{t('tools.affiliateEarningsCalculator.sections.negotiating.example.increase').replace('{amount}', (earnings.monthly * 0.5).toFixed(2))}</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                {t('tools.affiliateEarningsCalculator.sections.negotiating.paragraph4')}
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