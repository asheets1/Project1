import React, { useState } from 'react';

interface WorkoutFormProps {
  title: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    options?: { value: string; label: string }[];
    placeholder?: string;
    step?: string;
    required?: boolean;
  }[];
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({
  title,
  fields,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(
    Object.fromEntries(fields.map((f) => [f.name, '']))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setFormData(Object.fromEntries(fields.map((f) => [f.name, ''])));
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-6">{title}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="label">{field.label}</label>

            {field.type === 'select' ? (
              <select
                value={formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="input"
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="input resize-none h-24"
              />
            ) : (
              <input
                type={field.type}
                value={formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                step={field.step}
                className="input"
              />
            )}

            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary flex-1">
            {submitLabel}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
