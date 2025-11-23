
export default function ProfessionalTemplate({ data }) {
  const { personalInfo, summary, experience, education, skills, certifications, languages } = data;

  return (
    <div className="bg-white text-black p-12 min-h-[11in] w-[8.5in]" style={{ fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-4xl font-bold mb-2">{personalInfo?.name || "Your Name"}</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>•</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.location && <span>•</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
          {personalInfo?.website && <span>•</span>}
          {personalInfo?.website && <span>{personalInfo.website}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 uppercase">Professional Summary</h2>
          <p className="text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase">Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-lg font-semibold">{exp.position}</h3>
                  <p className="text-sm font-medium">{exp.company}</p>
                </div>
                <div className="text-right text-sm">
                  <p>{exp.location}</p>
                  <p className="text-gray-600">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </p>
                </div>
              </div>
              {exp.description && (
                <p className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase">Education</h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{edu.degree} in {edu.field}</h3>
                  <p className="text-sm">{edu.institution}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-600">
                    {edu.startDate} - {edu.endDate}
                  </p>
                  {edu.gpa && <p>GPA: {edu.gpa}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 uppercase">Skills</h2>
          <p className="text-sm">{skills.join(" • ")}</p>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 uppercase">Certifications</h2>
          <ul className="text-sm list-disc list-inside">
            {certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 uppercase">Languages</h2>
          <p className="text-sm">{languages.join(" • ")}</p>
        </div>
      )}
    </div>
  );
}
