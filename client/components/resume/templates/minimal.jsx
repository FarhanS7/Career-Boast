
export default function MinimalTemplate({ data }) {
  const { personalInfo, summary, experience, education, skills, certifications, languages } = data;

  return (
    <div className="bg-white text-black p-12 min-h-[11in] w-[8.5in]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-light mb-3 tracking-tight">{personalInfo?.name || "Your Name"}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-700">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
          {personalInfo?.website && <span>{personalInfo.website}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-8">
          <p className="text-sm leading-relaxed text-gray-800">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-4 tracking-widest uppercase text-gray-500">Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-5">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-medium">{exp.position}</h3>
                <span className="text-xs text-gray-600">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{exp.company}, {exp.location}</p>
              {exp.description && (
                <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-4 tracking-widest uppercase text-gray-500">Education</h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-medium">{edu.degree} in {edu.field}</h3>
                <span className="text-xs text-gray-600">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {edu.institution}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3 tracking-widest uppercase text-gray-500">Skills</h2>
          <p className="text-sm text-gray-800">{skills.join(", ")}</p>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3 tracking-widest uppercase text-gray-500">Certifications</h2>
          <ul className="text-sm text-gray-800 space-y-1">
            {certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3 tracking-widest uppercase text-gray-500">Languages</h2>
          <p className="text-sm text-gray-800">{languages.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
