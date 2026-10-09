import { useState } from 'react';

/**
 * Acordeão de perguntas frequentes — apenas uma pergunta aberta de cada vez.
 * Sem ícones decorativos: o próprio símbolo "+/-" tipográfico indica o estado,
 * e a resposta expande com transição de grid-template-rows (evita o "salto"
 * do max-height e funciona com conteúdo de altura variável).
 */
export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => setOpenIndex((current) => (current === index ? null : index));

  return (
    <div className="w-full space-y-4 " role="presentation">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={item.pergunta} className="rounded-[10px] border-2 border-gray-300 bg-gray-100 px-5">
            <h3>
              <button
                id={buttonId}
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center justify-between gap-4 py-5 text-left text-gray-600 hover:text-secondary-500 transition-colors"
              >
                <span className="text-base md:text-lg font-medium">{item.pergunta}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-2xl font-light leading-none text-secondary-500 transition-transform duration-300"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="pb-5 text-sm md:text-base text-primary-100 max-w-2xl leading-relaxed">
                  {item.resposta}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
