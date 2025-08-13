"use client"

import { useState } from 'react';
import { useLocaleTranslations } from '@/hooks/use-locale-translations';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQ() {
  const { t } = useLocaleTranslations();
  const [openAccordion, setOpenAccordion] = useState<number | null>(1);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: t('faq.questions.purpose.question'),
      answer: t('faq.questions.purpose.answer')
    },
    {
      id: 2,
      question: t('faq.questions.multipleCoupons.question'),
      answer: t('faq.questions.multipleCoupons.answer')
    },
    {
      id: 3,
      question: t('faq.questions.merchantData.question'),
      answer: t('faq.questions.merchantData.answer')
    },
    {
      id: 4,
      question: t('faq.questions.networkLimit.question'),
      answer: t('faq.questions.networkLimit.answer')
    },
    {
      id: 5,
      question: t('faq.questions.support.question'),
      answer: t('faq.questions.support.answer')
    }
  ];

  const toggleAccordion = (id: number) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <section>
      <div className="container mx-auto px-4 py-8">
        <div className="flex xl:flex-row flex-col items-start xl:gap-14">
          <div className="xl:mb-0 mb-12">
            <h4 className="text-[40px] font-semibold tracking-[-0.4px] leading-none text-black-1200 mb-6">
              {t('faq.title')}
            </h4>
            <p className="text-dark-gray-1200 font-normal text-lg tracking-[-0.18px] leading-[25px] xl:max-w-[420px] max-w-[630px] w-full">
              {t('faq.subtitle')}
            </p>
          </div>
          <div className="flex-1 w-full">
            <div id="accordion-collapse" data-accordion="collapse">
              {faqItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="mb-4 rounded-xl bg-gray-100 p-5"
                  data-aos="fade-up" 
                  data-aos-duration="500" 
                  data-aos-delay={200 + (index * 100)}
                >
                  <h2 id={`accordion-collapse-heading-${item.id}`}>
                    <button 
                      type="button" 
                      className="w-full bg-transparent flex items-center text-left justify-between tracking-[-0.16px] text-base font-medium leading-normal text-black"
                      onClick={() => toggleAccordion(item.id)}
                      aria-expanded={openAccordion === item.id}
                      aria-controls={`accordion-collapse-body-${item.id}`}
                    >
                      <span className="flex items-center flex-1 w-full pr-2.5 font-bold">
                        {item.question}
                      </span>
                      <span className="flex items-center justify-center w-6">
                        <svg 
                          className={`plus-icon flex items-center justify-center h-6 ${openAccordion === item.id ? 'hidden' : 'block'}`}
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <svg 
                          className={`minus-icon flex items-center justify-center h-6 ${openAccordion === item.id ? 'block' : 'hidden'}`}
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                  </h2>
                  <div 
                    id={`accordion-collapse-body-${item.id}`} 
                    className={openAccordion === item.id ? '' : 'hidden'} 
                    aria-labelledby={`accordion-collapse-heading-${item.id}`}
                  >
                    <div className="mt-3">
                      <p className="text-sm text-dark-gray-1200 font-normal tracking-[-0.16px] leading-normal">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Contact section */}
              <div 
                className="rounded-xl bg-gray-100 p-5 gap-4 flex sm:flex-row flex-col sm:items-center items-start justify-between"
                data-aos="fade-up" 
                data-aos-duration="500" 
                data-aos-delay="700"
              >
                <div className="flex-1 w-full">
                  <h4 className="text-black mb-1.5 text-left font-medium text-base tracking-[-0.16px] leading-normal">
                    {t('faq.contact.title')}
                  </h4>
                  <p className="text-sm font-normal tracking-[-0.14px] leading-normal text-dark-gray-1200">
                    {t('faq.contact.subtitle')}
                  </p>
                </div>
                <a 
                  href="mailto:info@affensus.com" 
                  className="inline-flex px-4 items-center justify-center text-white font-medium text-sm leading-none rounded-lg bg-black hover:bg-black-1300 h-10"
                >
                  {t('faq.contact.cta')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
