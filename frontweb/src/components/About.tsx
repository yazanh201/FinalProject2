
import { Award, Users, Clock, MapPin } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Award, number: "15+", label: "שנות ניסיון" },
    { icon: Users, number: "1000+", label: "לקוחות מרוצים" },
    { icon: Clock, number: "24/7", label: "זמינות" },
    { icon: MapPin, number: "1", label: "מיקום נוח" }
  ];

  return (
    <section id="about" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              למה לבחור בנו?
            </h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              אנחנו מוסך מקצועי עם שנות ניסיון רבות בתחום. הצוות המנוסה שלנו 
              מתמחה בכל סוגי הרכבים ומספק שירות איכותי ואמין.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300">
                  טכנאים מוסמכים עם ניסיון רב בתחום
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300">
                  ציוד מתקדם ואבחון ממוחשב
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300">
                  מחירים הוגנים ושירות מהיר
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300">
                  אחריות מלאה על כל השירותים
                </p>
              </div>
            </div>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 text-center hover:border-red-600/30 transition-all duration-300 hover:scale-105"
              >
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
