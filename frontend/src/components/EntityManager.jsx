import { useCallback, useEffect, useMemo, useState } from "react";

const initialForm = (fields) =>
  fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});

function EntityManager({ title, fields, service }) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialForm(fields));
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = useMemo(() => ["id", ...fields.map((field) => field.name)], [fields]);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await service.list();
      setItems(data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    Promise.resolve().then(() => {
      void loadItems();
      setFormData(initialForm(fields));
      setEditingId(null);
      setMessage("");
      setError("");
    });
  }, [fields, loadItems]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (item) => {
    const nextData = initialForm(fields);
    fields.forEach((field) => {
      nextData[field.name] = item[field.name] ?? "";
    });

    setFormData(nextData);
    setEditingId(item.id);
    setMessage(`Editing #${item.id}`);
    setError("");
  };

  const resetForm = () => {
    setFormData(initialForm(fields));
    setEditingId(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await service.update(editingId, formData);
        setMessage(`Updated ${title} #${editingId}`);
      } else {
        const created = await service.create(formData);
        setMessage(`Created ${title} #${created.id}`);
      }

      resetForm();
      await loadItems();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const onDelete = async (id) => {
    setError("");
    setMessage("");

    try {
      await service.remove(id);
      setMessage(`Deleted ${title} #${id}`);
      await loadItems();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>

      <form className="grid-form" onSubmit={onSubmit}>
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            <input
              name={field.name}
              type={field.type || "text"}
              value={formData[field.name]}
              required={Boolean(field.required)}
              onChange={onChange}
              placeholder={field.placeholder || ""}
            />
          </label>
        ))}

        <div className="form-actions">
          <button type="submit">{editingId ? "Save Changes" : `Add ${title}`}</button>
          {editingId ? (
            <button type="button" className="ghost" onClick={resetForm}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      {message ? <p className="notice success">{message}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}

      {isLoading ? (
        <p className="notice">Loading {title.toLowerCase()}...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 1}>No records yet.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    {headers.map((header) => (
                      <td key={`${item.id}-${header}`}>{String(item[header] ?? "")}</td>
                    ))}
                    <td className="row-actions">
                      <button type="button" className="ghost" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="danger" onClick={() => onDelete(item.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default EntityManager;
