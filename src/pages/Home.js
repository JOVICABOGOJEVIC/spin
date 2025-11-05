import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/shared/LanguageSwitcher';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Clock, 
  Shield, 
  Zap,
  Globe,
  BarChart3,
  Smartphone,
  Cloud,
  Database,
  ChevronRight,
  Play,
  Award,
  TrendingUp,
  Target,
  Rocket
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const handleGetStarted = () => {
    navigate('/auth?role=company&type=register');
  };

  const handleLogin = () => {
    navigate('/auth?role=company&type=login');
  };

  const features = [
    {
      icon: <Clock className="h-8 w-8 text-green-500" />,
      title: "Praćenje poslova u realnom vremenu",
      description: "Pratite poslove terenskih usluga u realnom vremenu sa GPS lokacijom i ažuriranjima statusa."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Upravljanje timom",
      description: "Upravljajte svojom radnom snagom sa dozvolama zasnovanim na ulogama i komunikacijom u realnom vremenu."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      title: "Analitička tabla",
      description: "Dobijte uvide u performanse vašeg poslovanja sa sveobuhvatnom analitikom."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "Sigurno i pouzdano",
      description: "Preduzećaška sigurnost sa 99.9% garancijom vremena rada za vaše poslovanje."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "€29",
      period: "/mesečno",
      description: "Savršeno za mala preduzeća",
      features: [
        "Do 5 radnika",
        "Osnovno upravljanje poslovima",
        "Pristup mobilnoj aplikaciji",
        "Email podrška"
      ],
      popular: false,
      color: "bg-gray-100"
    },
    {
      name: "Professional",
      price: "€79",
      period: "/mesečno",
      description: "Najbolje za rastuća preduzeća",
      features: [
        "Do 25 radnika",
        "Napredna analitika",
        "Praćenje u realnom vremenu",
        "Prioritetna podrška",
        "Prilagođena integracija"
      ],
      popular: true,
      color: "bg-green-50"
    },
    {
      name: "Enterprise",
      price: "€199",
      period: "/mesečno",
      description: "Za velike organizacije",
      features: [
        "Neograničen broj radnika",
        "Prilagođene funkcije",
        "Namenska podrška",
        "Napredna sigurnost",
        "API pristup"
      ],
      popular: false,
      color: "bg-blue-50"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Aktivnih korisnika" },
    { number: "99.9%", label: "Vreme rada" },
    { number: "50+", label: "Zemalja" },
    { number: "24/7", label: "Podrška" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-green-600 flex items-center">
                  SpinT<span className="text-white mx-0.5 animate-spin-slow inline-block" style={{ fontSize: '0.67em' }}>@</span>sker
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={handleLogin}
                className="text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('auth.login')}
              </button>
              <button
                onClick={() => navigate("/auth?role=worker&type=login")}
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('auth.loginForWorkers')}
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                {t('auth.register')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Platforma za terenske usluge za
              <span className="text-green-600"> dinamična, zahtevna</span> preduzeća
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Dostupniji za servisere: Sve što vam treba na jednom mestu. 
              Jednostavan sistem za upravljanje poslovima, timom i klijentima - bez komplikacija.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                Započni
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Play className="mr-2 h-5 w-5" />
                Pogledaj demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 mb-8">POVERENJE NAM JE DALO</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Kompanija A</div>
            <div className="text-2xl font-bold text-gray-400">Kompanija B</div>
            <div className="text-2xl font-bold text-gray-400">Kompanija C</div>
            <div className="text-2xl font-bold text-gray-400">Kompanija D</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              SpinTasker Platforma
            </h2>
            <p className="text-xl text-gray-600">
              Moderna platforma za terenske usluge za bilo koji slučaj upotrebe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Izaberite svoj plan
            </h2>
            <p className="text-xl text-gray-600">
              Počnite besplatno, a zatim rastite kako vaše poslovanje raste
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${plan.color} ${
                  plan.popular ? 'ring-2 ring-green-500' : ''
                } hover:shadow-xl transition-shadow`}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Najpopularnije
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={handleGetStarted}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Započni
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Spremni da transformišete svoje terenske usluge?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Pridružite se hiljadama kompanija koje već koriste SpinTasker
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Započni besplatnu probu
            </button>
            <button className="border border-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors">
              Kontaktiraj prodaju
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Proizvod</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Funkcije</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Cene</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kompanija</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">O nama</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Karijere</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Podrška</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Centar za pomoć</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Kontakt</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pravno</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privatnost</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Uslovi</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Sigurnost</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600">© 2025 SpinTasker. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;