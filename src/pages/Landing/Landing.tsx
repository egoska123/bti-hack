import { Sparkles, FileText, Users, Target, Eye, Shield, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LandingLogoIcon } from './icons/LandingLogoIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { ClockIcon } from './icons/ClockIcon';
import styles from './Landing.module.css';

// Header Component
function Header() {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <nav className={styles.nav}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <LandingLogoIcon />
            </div>
            <span className={styles.logoText}>RePlan</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#services" className={styles.navLink}>Услуги</a>
            <a href="#advantages" className={styles.navLink}>Преимущества</a>
            <a href="#faq" className={styles.navLink}>FAQ</a>
            <Button variant="default" size="sm" onClick={() => navigate('/login')} className={styles.loginButton}>Войти</Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

// Hero Section
function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <h1 className={styles.heroTitle}>
          Умная платформа для планирования перепланировок
        </h1>
        <p className={styles.heroDescription}>
          «Умное БТИ» — это цифровая платформа, которая упрощает все этапы работы с недвижимостью: 
          от консультаций по перепланировке до получения официальных документов.
        </p>
        <div className={styles.heroButtons}>
          <Button size="lg" className={styles.primaryButton} onClick={() => navigate('/editor')}>
            <Sparkles className={styles.buttonIcon} />
            Начать работу
            <ChevronRight className={styles.buttonChevron} />
          </Button>
          <Button variant="outline" size="lg" className={styles.secondaryButton} onClick={() => navigate('/executors')}>
            Для исполнителей
          </Button>
        </div>
      </div>
    </section>
  );
}

// Services Section
function ServicesSection() {
  const services = [
    {
      icon: <SparkleIcon />,
      bgColor: styles.serviceIconBg1,
      title: "Проверка перепланировки AI-ассистентом",
      description: "Загрузите план квартиры и текстом опишите изменения. AI заранее предупредит о рисках и нарушениях."
    },
    {
      icon: <Eye className={styles.serviceIcon} />,
      bgColor: styles.serviceIconBg2,
      title: "Визуализация «до/после»",
      description: "Наглядное 2D-отображение будущих изменений на плане вашей квартиры."
    },
    {
      icon: <FileText className={styles.serviceIcon} />,
      bgColor: styles.serviceIconBg3,
      title: "Оформление документов",
      description: "Заказ технических планов, выписок и других услуг БТИ онлайн."
    },
    {
      icon: <Users className={styles.serviceIcon} />,
      bgColor: styles.serviceIconBg4,
      title: "Поиск проверенных специалистов",
      description: "Мы автоматически подберем для вас геодезистов и кадастровых инженеров."
    }
  ];

  return (
    <section id="services" className={styles.servicesSection}>
      <div className={styles.sectionContainer}>
        <h2 className={styles.sectionTitle}>Основные услуги</h2>
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <Card key={index} className={styles.serviceCard}>
              <CardHeader className={styles.serviceCardHeader}>
                <div className={`${styles.serviceIconContainer} ${service.bgColor}`}>
                  {service.icon}
                </div>
                <CardTitle className={styles.serviceCardTitle}>{service.title}</CardTitle>
                <CardDescription className={styles.serviceCardDescription}>{service.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Advantages Section
function AdvantagesSection() {
  const advantages = [
    {
      icon: <ClockIcon />,
      bgColor: styles.advantageIconBg1,
      title: "Экономьте время и деньги",
      description: "Проверьте идею до начала ремонта. Избегайте штрафов и дорогостоящего исправления ошибок."
    },
    {
      icon: <Sparkles className={styles.advantageIcon} />,
      bgColor: styles.advantageIconBg2,
      title: "Понятно и наглядно",
      description: "AI-ассистент простыми словами объяснит риски, а инструмент визуализации покажет, как будет выглядеть квартира после изменений."
    },
    {
      icon: <Target className={styles.advantageIcon} />,
      bgColor: styles.advantageIconBg3,
      title: "Все услуги в одном окне",
      description: "От первой консультации до готовых документов. Больше не нужно ходить по инстанциям."
    },
    {
      icon: <Shield className={styles.advantageIcon} />,
      bgColor: styles.advantageIconBg4,
      title: "Безопасная сделка",
      description: "Работайте только с проверенными исполнителями, а расчеты проходят через безопасную платформу."
    }
  ];

  return (
    <section id="advantages" className={styles.advantagesSection}>
      <div className={styles.sectionContainer}>
        <h2 className={styles.sectionTitle}>Ключевые преимущества</h2>
        <div className={styles.advantagesGrid}>
          {advantages.map((advantage, index) => (
            <Card key={index} className={styles.advantageCard}>
              <CardHeader className={styles.advantageCardHeader}>
                <div className={styles.advantageContent}>
                  <div className={`${styles.advantageIconContainer} ${advantage.bgColor}`}>
                    {advantage.icon}
                  </div>
                  <div className={styles.advantageText}>
                    <CardTitle className={styles.advantageCardTitle}>{advantage.title}</CardTitle>
                    <CardDescription className={styles.advantageCardDescription}>{advantage.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: "Насколько точен анализ AI-ассистента?",
      answer: "AI-ассистент анализирует планы на основе актуальных строительных норм и правил. Точность анализа составляет более 95%, однако окончательное решение принимается профессиональными специалистами."
    },
    {
      question: "Что мне нужно для начала работы?",
      answer: "Для начала работы вам понадобится план вашей квартиры (можно в любом формате) и описание планируемых изменений. Регистрация занимает не более 2 минут."
    },
    {
      question: "Как происходит оплата?",
      answer: "Мы принимаем все основные способы оплаты: банковские карты, электронные кошельки, безналичный расчет для юридических лиц. Оплата производится только после согласования всех деталей."
    },
    {
      question: "Как быстро мне ответят?",
      answer: "AI-ассистент дает предварительный анализ в течение нескольких минут. Консультация со специалистом обычно назначается в течение 24 часов."
    }
  ];

  return (
    <section id="faq" className={styles.faqSection}>
      <div className={styles.faqContainer}>
        <h2 className={styles.sectionTitle}>Часто задаваемые вопросы</h2>
        <Accordion type="single" collapsible className={styles.accordion}>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className={styles.accordionItem}>
              <AccordionTrigger className={styles.accordionTrigger}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className={styles.accordionContent}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const navigate = useNavigate();
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaContainer}>
        <h2 className={styles.ctaTitle}>Готовы начать планирование?</h2>
        <p className={styles.ctaDescription}>
          Присоединяйтесь к тысячам пользователей, которые уже используют 
          RePlan для безопасной перепланировки
        </p>
        <Button size="lg" className={styles.ctaButton} onClick={() => navigate('/editor')}>
          <Sparkles className={styles.buttonIcon} />
          Начать бесплатно
          <ChevronRight className={styles.buttonChevron} />
        </Button>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <div className={styles.logoIcon}>
                <LandingLogoIcon />
              </div>
              <span className={styles.logoText}>RePlan</span>
            </div>
            <p className={styles.footerDescription}>Цифровая платформа для планирования перепланировок</p>
          </div>

          {/* For Users */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Для пользователей</h4>
            <ul className={styles.footerList}>
              <li><a href="#" className={styles.footerLink}>Как это работает</a></li>
              <li><a href="#" className={styles.footerLink}>Примеры проектов</a></li>
              <li><a href="#" className={styles.footerLink}>Тарифы</a></li>
            </ul>
          </div>

          {/* For Specialists */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Для специалистов</h4>
            <ul className={styles.footerList}>
              <li><a href="#" className={styles.footerLink}>Стать исполнителем</a></li>
              <li><a href="#" className={styles.footerLink}>Условия работы</a></li>
              <li><a href="#" className={styles.footerLink}>Поддержка</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Контакты</h4>
            <ul className={styles.footerList}>
              <li><a href="mailto:info@replan.com" className={styles.footerLink}>info@replan.com</a></li>
              <li><a href="tel:+78001234567" className={styles.footerLink}>+7 (800) 123-45-67</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>© 2024 RePlan. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Component
export const Landing = () => {
  return (
    <div className={styles.root}>
      <Header />
      <main className={styles.main}>
        <HeroSection />
        <ServicesSection />
        <AdvantagesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};
