import { useTranslation } from 'react-i18next'

export default function About() {
  const { t } = useTranslation()

  const education = [
    {
      degreeKey: 'about.edu1Degree',
      schoolKey: 'about.edu1School',
      yearKey: 'about.edu1Year',
      focusKey: 'about.edu1Focus',
    },
    {
      degreeKey: 'about.edu2Degree',
      schoolKey: 'about.edu2School',
      yearKey: 'about.edu2Year',
      focusKey: 'about.edu2Focus',
    },
    {
      degreeKey: 'about.edu3Degree',
      schoolKey: 'about.edu3School',
      yearKey: 'about.edu3Year',
      focusKey: 'about.edu3Focus',
    },
  ]

  const experience = [
    {
      titleKey: 'about.exp1Title',
      companyKey: 'about.exp1Company',
      periodKey: 'about.exp1Period',
      descKey: 'about.exp1Desc',
    },
    {
      titleKey: 'about.exp2Title',
      companyKey: 'about.exp2Company',
      periodKey: 'about.exp2Period',
      descKey: 'about.exp2Desc',
    },
    {
      titleKey: 'about.exp3Title',
      companyKey: 'about.exp3Company',
      periodKey: 'about.exp3Period',
      descKey: 'about.exp3Desc',
    },
  ]

  const skillCategories = [
    {
      title: 'LLM & AI',
      skills: ['LangChain', 'LangGraph', 'LangSmith', 'OpenAI API', 'AutoGen'],
      colorClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'ML/DL',
      skills: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'XGBoost', 'LightGBM'],
      colorClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Backend & DevOps',
      skills: ['Python', 'FastAPI', 'Docker', 'SQL', 'Git'],
      colorClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-400">
            {t('about.intro')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Education */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t('about.education')}</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div
                  key={edu.degreeKey}
                  className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white group-hover:text-[var(--persona-primary)] transition-colors">
                      {t(edu.degreeKey)}
                    </h3>
                    <span className="text-sm text-gray-500">{t(edu.yearKey)}</span>
                  </div>
                  <p className="text-[var(--persona-primary)] mb-1">{t(edu.schoolKey)}</p>
                  <p className="text-sm text-gray-500">{t('about.focus')}: {t(edu.focusKey)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t('about.experience')}</h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div
                  key={exp.titleKey}
                  className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white group-hover:text-[var(--persona-primary)] transition-colors">
                      {t(exp.titleKey)}
                    </h3>
                    <span className="text-sm text-gray-500">{t(exp.periodKey)}</span>
                  </div>
                  <p className="text-[var(--persona-primary)] mb-2">{t(exp.companyKey)}</p>
                  <p className="text-sm text-gray-400">{t(exp.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">{t('about.skills')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {skillCategories.map((category) => (
              <div
                key={category.title}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="font-semibold text-white mb-4">{category.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 text-sm rounded-full border ${category.colorClass}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
