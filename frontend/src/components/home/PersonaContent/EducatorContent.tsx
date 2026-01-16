import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PERSONAS } from '@/store'
import { courses, courseStats, educatorTimeline } from '@/data'
import { PersonaTimeline } from '../PersonaTimeline'

export function EducatorContent() {
  const { t, i18n } = useTranslation()
  const persona = PERSONAS.educator
  const isEnglish = i18n.language === 'en'

  return (
    <>
      {/* Stats Section */}
      <section className="py-4 px-4">
        <div className="container-custom">
          <div className="flex justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div
                className="text-3xl md:text-4xl font-bold"
                style={{ color: persona.color }}
              >
                {courseStats.courses}
              </div>
              <div className="text-sm text-gray-400">{t('talks.coursesCount')}</div>
            </div>
            <div className="text-center">
              <div
                className="text-3xl md:text-4xl font-bold"
                style={{ color: persona.color }}
              >
                {courseStats.universities}
              </div>
              <div className="text-sm text-gray-400">{t('talks.universities')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <PersonaTimeline items={educatorTimeline} color={persona.color} />

      {/* Courses Section */}
      <section className="py-10 px-4">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-white mb-6">
            {t('talks.teaching')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-[var(--persona-primary)]/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Course Icon */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${persona.color}20` }}
                  >
                    {persona.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[var(--persona-primary)] transition-colors">
                      {t(course.courseKey)}
                    </h3>
                    <p style={{ color: persona.color }}>{t(course.uniKey)}</p>
                    <p className="text-sm text-gray-500">{t(course.deptKey)}</p>
                    <p className="text-sm text-gray-400 mt-2">{t(course.periodKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="py-10 px-4 bg-gray-900/30">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-6">
              {isEnglish ? 'Teaching Philosophy' : 'Egitim Felsefem'}
            </h2>
            <p className="text-gray-400 leading-relaxed">
              {isEnglish
                ? 'I believe in hands-on, project-based learning that bridges the gap between theoretical knowledge and real-world applications. My courses focus on practical AI implementations, encouraging students to build and experiment with cutting-edge technologies.'
                : 'Teorik bilgi ile gercek dunya uygulamalari arasindaki boslugu kapatan, proje tabanli ogrenmeye inaniyorum. Derslerim pratik AI uygulamalarina odaklanir ve ogrencileri en son teknolojilerle deneyler yapmaya tesvik eder.'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {t('home.letsWork')}
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            {t('home.letsWorkDesc')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:brightness-110"
            style={{ backgroundColor: persona.color }}
          >
            {t('home.contactMe')}
          </Link>
        </div>
      </section>
    </>
  )
}
