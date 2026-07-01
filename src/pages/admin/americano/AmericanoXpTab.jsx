import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { ownerApi } from "../../../helpers/api/apiCore";
import { AMER_XP_GET, AMER_XP_UPDATE, GET_CATEGORY_LIST } from "../../../helpers/api/apiEndpoint";
import { toast } from "react-toastify";

const AmericanoXpTab = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [multipliers, setMultipliers] = useState({
    first: "",
    second: "",
    third: "",
  });
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await ownerApi.get(`${GET_CATEGORY_LIST}?limit=100`);
        setCategories(data?.data || []);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setMultipliers({ first: "", second: "", third: "" });
      return;
    }
    
    const fetchConfig = async () => {
      setLoadingConfig(true);
      try {
        const { data } = await ownerApi.get(`${AMER_XP_GET}/${selectedCategoryId}/xp`);
        if (data?.xpMultipliers) {
          setIsNew(false);
          setMultipliers({
            first: data.xpMultipliers.first ?? "",
            second: data.xpMultipliers.second ?? "",
            third: data.xpMultipliers.third ?? "",
          });
        } else {
          setIsNew(true);
          setMultipliers({ first: "", second: "", third: "" });
        }
      } catch (error) {
        toast.error("Failed to load XP settings");
        console.error(error);
      } finally {
        setLoadingConfig(false);
      }
    };
    
    fetchConfig();
  }, [selectedCategoryId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMultipliers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = 
    multipliers.first !== "" && Number(multipliers.first) >= 0 &&
    multipliers.second !== "" && Number(multipliers.second) >= 0 &&
    multipliers.third !== "" && Number(multipliers.third) >= 0;

  const handleSave = async () => {
    if (!isFormValid) {
      toast.error("All multipliers must be positive numbers.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        xpMultipliers: {
          first: Number(multipliers.first),
          second: Number(multipliers.second),
          third: Number(multipliers.third),
        },
      };
      if (isNew) {
        await ownerApi.post(`${AMER_XP_UPDATE}/${selectedCategoryId}/xp`, payload);
        setIsNew(false);
        toast.success("Americano XP multipliers created successfully");
      } else {
        await ownerApi.put(`${AMER_XP_UPDATE}/${selectedCategoryId}/xp`, payload);
        toast.success("Americano XP multipliers updated successfully");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save XP settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setMultipliers({ first: 5, second: 3, third: 1.5 });
    toast.info("Reset to default Americano XP values");
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header d-flex justify-content-between align-items-center" style={{ background: 'rgb(31, 65, 187)', color: '#fff' }}>
        <h5 className="mb-0 fw-bold">⚙️ Americano Global XP Settings</h5>
        <button 
          className="btn btn-sm btn-light"
          onClick={resetToDefaults}
          disabled={loadingConfig || saving || !selectedCategoryId}
        >
          Reset to Defaults
        </button>
      </div>
      <div className="card-body p-4">
        <p className="text-muted small mb-4">
          Configure global XP multipliers for Americano matches per category.
          <br /><br />
          <strong>Formula:</strong><br />
          1st Place gains: <code>baseXP × 1st Place Multiplier</code><br />
          2nd Place gains: <code>baseXP × 2nd Place Multiplier</code><br />
          3rd Place gains: <code>baseXP × 3rd Place Multiplier</code>
        </p>

        <div className="mb-4 w-50">
          <label className="fw-semibold mb-2">Select Category</label>
          <select 
            className="form-select"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">— Choose Category —</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategoryId && (
          loadingConfig ? (
            <div className="placeholder-glow">
              <span className="placeholder col-12 rounded mb-2" style={{ height: 60 }} />
              <span className="placeholder col-12 rounded mb-2" style={{ height: 60 }} />
              <span className="placeholder col-12 rounded" style={{ height: 60 }} />
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th>Placement</th>
                      <th>Multiplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="align-middle fw-semibold">1st Place</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          step="0.1"
                          min="0"
                          name="first"
                          value={multipliers.first}
                          onChange={handleChange}
                          placeholder="e.g. 5"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="align-middle fw-semibold">2nd Place</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          step="0.1"
                          min="0"
                          name="second"
                          value={multipliers.second}
                          onChange={handleChange}
                          placeholder="e.g. 3"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="align-middle fw-semibold">3rd Place</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          step="0.1"
                          min="0"
                          name="third"
                          value={multipliers.third}
                          onChange={handleChange}
                          placeholder="e.g. 1.5"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="alert alert-info small mt-3">
                <strong>Examples:</strong>
                <ul className="mb-0 mt-2">
                  <li>1st Place: 5x multiplier</li>
                  <li>2nd Place: 3x multiplier</li>
                  <li>3rd Place: 1.5x multiplier</li>
                </ul>
              </div>

              <button
                className="btn w-100 text-white fw-bold mt-3"
                style={{ background: 'rgb(31, 65, 187)' }}
                onClick={handleSave}
                disabled={saving || !isFormValid}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Saving...
                  </>
                ) : (
                  isNew ? 'Create XP Multipliers' : 'Save Changes'
                )}
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default AmericanoXpTab;
