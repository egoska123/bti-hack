import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { usePlanContext } from '@/components/shared/2dPlan/PlanContext';
import { createElement } from './lib/createElement';
import { Plus } from 'lucide-react';
import styles from './EditorTools.module.css';

export const EditorTools = () => {
  let addElement: ((element: any) => void) | null = null;
  
  try {
    const context = usePlanContext();
    addElement = context.addElement;
  } catch (error) {
    console.warn('PlanContext not available:', error);
  }

  const handleAddTool = (category: string, toolName: string) => {
    if (!addElement) {
      console.error('addElement function is not available');
      return;
    }
    
    const element = createElement(category, toolName);
    if (element) {
      console.log('Adding element:', element);
      addElement(element);
    } else {
      console.warn('Failed to create element for:', category, toolName);
    }
  };

  return (
    <div className={styles.root}>
      <Accordion type="multiple" className={styles.accordion}>
        <AccordionItem value="walls" className={styles.item}>
          <AccordionTrigger className={styles.trigger}>
            <span className={styles.triggerText}>Стены</span>
          </AccordionTrigger>
          <AccordionContent className={styles.content}>
            <div className={styles.toolsList}>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Несущая стена</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('walls', 'Несущая стена')}
                  aria-label="Добавить несущую стену"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Перегородка</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('walls', 'Перегородка')}
                  aria-label="Добавить перегородку"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Внешняя стена</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('walls', 'Внешняя стена')}
                  aria-label="Добавить внешнюю стену"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="doors" className={styles.item}>
          <AccordionTrigger className={styles.trigger}>
            <span className={styles.triggerText}>Двери</span>
          </AccordionTrigger>
          <AccordionContent className={styles.content}>
            <div className={styles.toolsList}>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Одностворчатая</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('doors', 'Одностворчатая')}
                  aria-label="Добавить одностворчатую дверь"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Двустворчатая</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('doors', 'Двустворчатая')}
                  aria-label="Добавить двустворчатую дверь"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Раздвижная</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('doors', 'Раздвижная')}
                  aria-label="Добавить раздвижную дверь"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="windows" className={styles.item}>
          <AccordionTrigger className={styles.trigger}>
            <span className={styles.triggerText}>Окна</span>
          </AccordionTrigger>
          <AccordionContent className={styles.content}>
            <div className={styles.toolsList}>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Стандартное</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('windows', 'Стандартное')}
                  aria-label="Добавить стандартное окно"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Панорамное</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('windows', 'Панорамное')}
                  aria-label="Добавить панорамное окно"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Мансардное</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('windows', 'Мансардное')}
                  aria-label="Добавить мансардное окно"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="zones" className={styles.item}>
          <AccordionTrigger className={styles.trigger}>
            <span className={styles.triggerText}>Зоны</span>
          </AccordionTrigger>
          <AccordionContent className={styles.content}>
            <div className={styles.toolsList}>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Гостиная</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('zones', 'Гостиная')}
                  aria-label="Добавить зону гостиной"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Спальня</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('zones', 'Спальня')}
                  aria-label="Добавить зону спальни"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Кухня</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('zones', 'Кухня')}
                  aria-label="Добавить зону кухни"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
              <div className={styles.toolRow}>
                <button className={styles.toolButton}>Ванная</button>
                <button 
                  className={styles.addButton}
                  onClick={() => handleAddTool('zones', 'Ванная')}
                  aria-label="Добавить зону ванной"
                >
                  <Plus className={styles.addIcon} />
                </button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="furniture" className={styles.item}>
          <AccordionTrigger className={styles.trigger}>
            <span className={styles.triggerText}>Мебель</span>
          </AccordionTrigger>
          <AccordionContent className={styles.content}>
            <div className={styles.toolsList}>
              <button className={styles.toolButton}>Диван</button>
              <button className={styles.toolButton}>Кровать</button>
              <button className={styles.toolButton}>Стол</button>
              <button className={styles.toolButton}>Стул</button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

