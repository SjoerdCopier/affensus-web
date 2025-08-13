"use client"

import { useState } from 'react';
import { useLocaleTranslations } from '@/hooks/use-locale-translations';
import pricingPlans from '@/pricing-plans.json';

export default function Pricing() {
  const { t, currentLocale } = useLocaleTranslations();
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const formatPrice = (amount: number) => {
    const price = amount / 100;
    return price % 1 === 0 ? price.toString() : price.toFixed(2);
  };

  const plans = Object.values(pricingPlans.plans);

  return (
    <section id="pricing">
      <div className="container mx-auto px-4 py-8">
        <div className="md:text-center" data-aos="fade-up" data-aos-duration="500">
          <h3 className="text-[40px] font-semibold text-black-1200 tracking-[-0.4px] md:leading-normal leading-none mb-4">
            {t('pricing.title')}
          </h3>
          <p className="text-lg font-normal leading-6 tracking-[-0.18px] text-dark-gray-1200 max-w-[630px] w-full mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>
        
        <div className="max-w-[1090px] w-full md:mx-auto">
          <div className="flex items-center md:justify-center mt-8" data-aos="fade-up" data-aos-duration="500">
            <div className="bg-gray-100 rounded-xl p-1 inline-flex relative">
              <button 
                className={`relative z-10 sm:text-base text-sm font-medium tracking-[-0.16px] flex items-center justify-center rounded-lg py-2 px-4 transition-all duration-300 ${
                  !isYearly ? 'text-black bg-white shadow-sm' : 'text-gray-600 hover:text-black bg-transparent'
                }`}
                onClick={() => setIsYearly(false)}
                type="button" 
                role="tab"
              >
                {t('pricing.billing.monthly')}
              </button>
              
              <button 
                className={`relative z-10 sm:text-base text-sm font-medium tracking-[-0.16px] flex items-center justify-center rounded-lg py-2 px-4 transition-all duration-300 whitespace-nowrap ${
                  isYearly ? 'text-black bg-white shadow-sm' : 'text-gray-600 hover:text-black bg-transparent'
                }`}
                onClick={() => setIsYearly(true)}
                type="button" 
                role="tab"
              >
                {t('pricing.billing.yearly')} 
                <span className="bg-gray-400 w-[3px] h-[3px] rounded-full mx-2"></span>
                🔥 {t('pricing.billing.discount')}
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap mt-14 xl:-mx-2.5 mx-0">
            {plans.map((plan, index) => (
              <div 
                key={plan.id}
                className="xl:w-4/12 w-full xl:px-2.5 px-0 xl:mb-0 mb-6" 
                data-aos="fade-up" 
                data-aos-duration="500" 
                data-aos-delay={200 + (index * 100)}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                <div className={`bg-gray-100 border-2 border-solid rounded-3xl px-6 py-[30px] transition-colors duration-300 ${
                  hoveredPlan === plan.id 
                    ? 'border-green-600' 
                    : hoveredPlan === null && plan.popular 
                      ? 'border-green-600' 
                      : 'border-gray-100'
                }`}>
                  <div>
                    <h4 className="text-xl mb-3 font-semibold tracking-[-0.4px] leading-none flex items-center gap-2">
                      {plan.name[currentLocale as keyof typeof plan.name] || plan.name.en}
                      {plan.popular && (
                        <span className="flex items-center justify-center font-medium text-xs tracking-[-0.36px] leading-none text-green-800 bg-green-100 rounded-md h-[26px] w-[65px]">
                          {t('pricing.popular')}
                        </span>
                      )}
                    </h4>
                    <p className="text-gray-1800 xl:max-w-[300px] w-full text-sm font-normal tracking-[-0.16px] leading-[20px]">
                      {plan.description[currentLocale as keyof typeof plan.description] || plan.description.en}
                    </p>
                  </div>
                  
                  <div className="pb-8 pt-[26px] border-b border-dashed border-gray-300">
                    <h3 className="text-black-1200 mb-3 text-[40px] font-semibold tracking-[-0.4px] leading-none flex items-end">
                      {isYearly ? plan.price.yearly.symbol : plan.price.monthly.symbol}{formatPrice(isYearly ? plan.price.yearly.amount : plan.price.monthly.amount)}
                      <span className="text-gray-1800 font-normal text-base leading-none inline-flex mb-1.5">
                        / {isYearly 
                          ? (plan.billing.yearly[currentLocale as keyof typeof plan.billing.yearly] || plan.billing.yearly.en)
                          : (plan.billing.monthly[currentLocale as keyof typeof plan.billing.monthly] || plan.billing.monthly.en)
                        }
                      </span>
                    </h3>
                    <p className="text-dark-gray-1200 mb-[30px] text-sm font-normal tracking-[-0.14px] leading-none">
                      {isYearly 
                        ? `${t('pricing.billed')} ${plan.billing.yearly[currentLocale as keyof typeof plan.billing.yearly] || plan.billing.yearly.en}ly, ${plan.price.monthly.symbol}${formatPrice(Math.round(plan.price.yearly.amount / 12))} per month`
                        : `${t('pricing.billed')} ${plan.billing.monthly[currentLocale as keyof typeof plan.billing.monthly] || plan.billing.monthly.en}ly`
                      }
                    </p>
                    <a 
                      href="#" 
                      className="inline-flex px-4 items-center justify-center text-white font-medium text-sm leading-none rounded-lg h-10 bg-green-600 hover:bg-green-700 transition-colors duration-300"
                    >
                      {t('pricing.cta')}
                    </a>
                  </div>
                  
                  <ul className="mt-9 xl:block grid md:grid-cols-2 grid-cols-1">
                    {(plan.features[currentLocale as keyof typeof plan.features] || plan.features.en).map((feature, featureIndex) => (
                      <li key={featureIndex} className={`flex items-center gap-3 ${featureIndex === (plan.features[currentLocale as keyof typeof plan.features] || plan.features.en).length - 1 ? '' : 'mb-1'}`}>
                        <span className="flex items-center justify-center w-6">
                          <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <p className="text-dark-gray-1200 text-sm font-normal leading-none">
                          {feature}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-[56px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="500">
          <p className="text-dark-gray-1200 font-normal text-lg tracking-[-0.18px] leading-[25.2px] md:text-center text-left xl:max-w-[630px] w-full mx-auto mb-[26px]">
            {t('pricing.security')}
          </p>
          <p className="text-dark-gray-1200 font-normal text-lg tracking-[-0.18px] leading-[25.2px] md:text-center text-left xl:max-w-[630px] w-full mx-auto">
            {t('pricing.earnings')}
          </p>
        </div>
      </div>
    </section>
  );
}
