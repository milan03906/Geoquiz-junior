export default function McqQuestion({ question, value, onChange }) {
  const options = question.options || [];

  return (
    <div className="mcq-wrapper">
      <div className="options">
        {options.map((option) => (
          <label key={option} className="option-item">
            <input
              type="radio"
              name={question._id}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}