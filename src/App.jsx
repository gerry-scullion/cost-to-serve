import { useState, useMemo } from 'react';

const INITIAL_ACTORS = [
  { id: 1, name: 'Actor 1', salary: 45000 },
  { id: 2, name: 'Actor 2', salary: 38000 },
];

const INITIAL_STAGES = [
  { id: 1, name: 'Awareness' },
  { id: 2, name: 'Join' },
  { id: 3, name: 'Use' },
  { id: 4, name: 'Support' },
  { id: 5, name: 'Exit' },
];

const INITIAL_INDIRECT_COSTS = {
  rent: 95000,
  training: 200000,
  payroll: 20000,
  insurance: 20000,
  utilities: 20000,
  tools: 20000,
};

export default function CostToServeCalculator() {
  const [step, setStep] = useState(0);
  const [workingDays, setWorkingDays] = useState(250);
  const [hoursPerDay, setHoursPerDay] = useState(7.5);
  const [totalStaff, setTotalStaff] = useState(100);
  const [actors, setActors] = useState(INITIAL_ACTORS);
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [indirectCosts, setIndirectCosts] = useState(INITIAL_INDIRECT_COSTS);
  const [timeMatrix, setTimeMatrix] = useState({});
  const [customerCount, setCustomerCount] = useState(10000);

  const hoursPerYear = workingDays * hoursPerDay;
  const minutesPerYear = hoursPerYear * 60;

  const actorRates = useMemo(() => {
    return actors.map(actor => {
      const hourly = actor.salary / hoursPerYear;
      const perMinute = hourly / 60;
      return { ...actor, hourly, perMinute };
    });
  }, [actors, hoursPerYear]);

  const indirectPerEmployee = useMemo(() => {
    const total = Object.values(indirectCosts).reduce((a, b) => a + b, 0);
    return totalStaff > 0 ? total / totalStaff : 0;
  }, [indirectCosts, totalStaff]);

  const calculations = useMemo(() => {
    const costByStage = {};
    const costByActor = {};
    let totalCost = 0;

    stages.forEach(stage => {
      costByStage[stage.id] = 0;
    });

    actorRates.forEach(actor => {
      costByActor[actor.id] = 0;
      stages.forEach(stage => {
        const minutes = timeMatrix[`${actor.id}-${stage.id}`] || 0;
        const cost = minutes * actor.perMinute;
        costByStage[stage.id] += cost;
        costByActor[actor.id] += cost;
        totalCost += cost;
      });
    });

    const costToServe = customerCount > 0 ? totalCost / customerCount : 0;

    return { costByStage, costByActor, totalCost, costToServe };
  }, [actorRates, stages, timeMatrix, customerCount]);

  const updateActor = (id, field, value) => {
    setActors(actors.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addActor = () => {
    const newId = Math.max(...actors.map(a => a.id), 0) + 1;
    setActors([...actors, { id: newId, name: `Actor ${newId}`, salary: 30000 }]);
  };

  const removeActor = (id) => {
    if (actors.length > 1) {
      setActors(actors.filter(a => a.id !== id));
    }
  };

  const updateStage = (id, name) => {
    setStages(stages.map(s => s.id === id ? { ...s, name } : s));
  };

  const addStage = () => {
    const newId = Math.max(...stages.map(s => s.id), 0) + 1;
    setStages([...stages, { id: newId, name: `Stage ${newId}` }]);
  };

  const removeStage = (id) => {
    if (stages.length > 1) {
      setStages(stages.filter(s => s.id !== id));
    }
  };

  const updateTime = (actorId, stageId, minutes) => {
    setTimeMatrix({ ...timeMatrix, [`${actorId}-${stageId}`]: parseFloat(minutes) || 0 });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const maxStageCost = Math.max(...Object.values(calculations.costByStage), 1);
  const maxActorCost = Math.max(...Object.values(calculations.costByActor), 1);

  const steps = [
    { title: 'Setup', icon: '⚙️' },
    { title: 'Actors', icon: '👥' },
    { title: 'Indirect Costs', icon: '🏢' },
    { title: 'Journey Stages', icon: '🗺️' },
    { title: 'Time Allocation', icon: '⏱️' },
    { title: 'Results', icon: '📊' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: '#e2e8f0',
      padding: '0',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        input, button { font-family: inherit; }
        input:focus, button:focus { outline: none; }
        input[type="number"]::-webkit-inner-spin-button { opacity: 1; }
        .step-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(255,107,107,0.3); }
        .card { backdrop-filter: blur(10px); }
        .input-field:focus { border-color: #ff6b6b; box-shadow: 0 0 0 3px rgba(255,107,107,0.2); }
        .bar-animate { transition: width 0.5s ease-out; }
      `}</style>
      
      {/* Header */}
      <header style={{
        padding: '24px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            color: '#fff',
          }}>₵</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              Cost to Serve
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', letterSpacing: '0.5px' }}>
              Service Design Framework by <a href="https://www.thisishcd.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ff8e53', textDecoration: 'none' }}>Gerry Scullion</a>
            </p>
          </div>
        </div>
        <div style={{
          background: 'rgba(255,107,107,0.1)',
          border: '1px solid rgba(255,107,107,0.3)',
          borderRadius: '8px',
          padding: '8px 16px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '14px',
        }}>
          Total: <span style={{ color: '#ff6b6b', fontWeight: '700' }}>{formatCurrency(calculations.totalCost)}</span>
        </div>
      </header>

      {/* Progress Steps */}
      <nav style={{
        padding: '24px 32px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className="step-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: step === i 
                ? 'linear-gradient(135deg, #ff6b6b, #ff8e53)'
                : 'rgba(255,255,255,0.05)',
              border: step === i ? 'none' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px',
              color: step === i ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              fontSize: '14px',
              fontWeight: step === i ? '600' : '400',
            }}
          >
            <span>{s.icon}</span>
            <span>{s.title}</span>
            {i < step && <span style={{ marginLeft: '4px', opacity: 0.7 }}>✓</span>}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Step 0: Setup */}
        {step === 0 && (
          <div className="card" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '40px',
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '700' }}>
              Organisation Setup
            </h2>
            <p style={{ margin: '0 0 32px', color: '#94a3b8' }}>
              Configure your baseline working parameters to calculate accurate hourly rates.
            </p>
            
            <div style={{ display: 'grid', gap: '24px', maxWidth: '500px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
                  Working Days per Year
                </label>
                <input
                  type="number"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '18px',
                    fontFamily: "'Space Mono', monospace",
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
                  Hours per Day
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '18px',
                    fontFamily: "'Space Mono', monospace",
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
                  Total Staff in Organisation
                </label>
                <input
                  type="number"
                  value={totalStaff}
                  onChange={(e) => setTotalStaff(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '18px',
                    fontFamily: "'Space Mono', monospace",
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
                  Number of Customers/Citizens Served
                </label>
                <input
                  type="number"
                  value={customerCount}
                  onChange={(e) => setCustomerCount(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '18px',
                    fontFamily: "'Space Mono', monospace",
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
            </div>
            
            <div style={{
              marginTop: '32px',
              padding: '20px',
              background: 'rgba(255,107,107,0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(255,107,107,0.2)',
            }}>
              <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: '14px' }}>
                <strong style={{ color: '#ff6b6b' }}>Calculated:</strong> {hoursPerYear.toFixed(1)} hours/year • {minutesPerYear.toFixed(0)} minutes/year
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Actors */}
        {step === 1 && (
          <div className="card" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '40px',
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '700' }}>
              Define Actors
            </h2>
            <p style={{ margin: '0 0 32px', color: '#94a3b8' }}>
              Actors are the roles involved in delivering your service. Add their annual salaries to calculate hourly rates.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {actors.map(actor => (
                <div key={actor.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px auto auto auto',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <input
                    type="text"
                    value={actor.name}
                    onChange={(e) => updateActor(actor.id, 'name', e.target.value)}
                    placeholder="Role name"
                    className="input-field"
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '15px',
                    }}
                  />
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontFamily: "'Space Mono', monospace",
                    }}>€</span>
                    <input
                      type="number"
                      value={actor.salary}
                      onChange={(e) => updateActor(actor.id, 'salary', parseFloat(e.target.value) || 0)}
                      className="input-field"
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 28px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '15px',
                        fontFamily: "'Space Mono', monospace",
                      }}
                    />
                  </div>
                  <div style={{ 
                    padding: '8px 12px', 
                    background: 'rgba(255,107,107,0.1)', 
                    borderRadius: '6px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    color: '#ff8e53',
                    whiteSpace: 'nowrap',
                  }}>
                    {formatCurrency(actorRates.find(a => a.id === actor.id)?.hourly || 0)}/hr
                  </div>
                  <div style={{ 
                    padding: '8px 12px', 
                    background: 'rgba(107,255,107,0.1)', 
                    borderRadius: '6px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    color: '#6bff6b',
                    whiteSpace: 'nowrap',
                  }}>
                    {formatCurrency(actorRates.find(a => a.id === actor.id)?.perMinute || 0)}/min
                  </div>
                  <button
                    onClick={() => removeActor(actor.id)}
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'rgba(255,107,107,0.1)',
                      border: '1px solid rgba(255,107,107,0.3)',
                      borderRadius: '8px',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                      fontSize: '18px',
                      opacity: actors.length > 1 ? 1 : 0.3,
                    }}
                    disabled={actors.length <= 1}
                  >×</button>
                </div>
              ))}
            </div>
            
            <button
              onClick={addActor}
              style={{
                marginTop: '16px',
                padding: '14px 24px',
                background: 'transparent',
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
            >
              + Add Actor
            </button>
          </div>
        )}

        {/* Step 2: Indirect Costs */}
        {step === 2 && (
          <div className="card" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '40px',
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '700' }}>
              Indirect Costs
            </h2>
            <p style={{ margin: '0 0 32px', color: '#94a3b8' }}>
              These are organisational overheads allocated per employee to understand true cost of delivery.
            </p>
            
            <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
              {Object.entries(indirectCosts).map(([key, value]) => (
                <div key={key} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto',
                  gap: '16px',
                  alignItems: 'center',
                }}>
                  <label style={{ 
                    textTransform: 'capitalize', 
                    color: '#e2e8f0',
                    fontSize: '15px',
                  }}>
                    {key === 'tools' ? 'Tools (Hardware, Software)' : 
                     key === 'utilities' ? 'Utilities & Facilities' : key}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}>€</span>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setIndirectCosts({
                        ...indirectCosts,
                        [key]: parseFloat(e.target.value) || 0
                      })}
                      className="input-field"
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 28px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '15px',
                        fontFamily: "'Space Mono', monospace",
                      }}
                    />
                  </div>
                  <span style={{ 
                    fontFamily: "'Space Mono', monospace", 
                    fontSize: '12px', 
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                  }}>
                    /year
                  </span>
                </div>
              ))}
            </div>
            
            <div style={{
              marginTop: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,142,83,0.1))',
              borderRadius: '16px',
              border: '1px solid rgba(255,107,107,0.2)',
            }}>
              <div style={{ 
                fontFamily: "'Space Mono', monospace", 
                fontSize: '14px',
                color: '#94a3b8',
                marginBottom: '8px',
              }}>
                Total Indirect Cost per Employee
              </div>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700',
                color: '#ff6b6b',
                fontFamily: "'Space Mono', monospace",
              }}>
                {formatCurrency(indirectPerEmployee)}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Journey Stages */}
        {step === 3 && (
          <div className="card" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '40px',
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '700' }}>
              Journey Stages
            </h2>
            <p style={{ margin: '0 0 32px', color: '#94a3b8' }}>
              Define the stages of your customer/citizen journey. These will form the columns of your cost matrix.
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px',
              marginBottom: '24px',
            }}>
              {stages.map((stage, index) => (
                <div key={stage.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}>{index + 1}</span>
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateStage(stage.id, e.target.value)}
                    className="input-field"
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: '15px',
                      width: '120px',
                    }}
                  />
                  <button
                    onClick={() => removeStage(stage.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                      fontSize: '16px',
                      opacity: stages.length > 1 ? 0.6 : 0.2,
                    }}
                    disabled={stages.length <= 1}
                  >×</button>
                </div>
              ))}
              <button
                onClick={addStage}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: '2px dashed rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                + Add Stage
              </button>
            </div>
            
            {/* Journey visualization */}
            <div style={{
              marginTop: '32px',
              padding: '24px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '16px',
              overflowX: 'auto',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'fit-content' }}>
                {stages.map((stage, i) => (
                  <div key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,142,83,0.2))',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,107,107,0.3)',
                      whiteSpace: 'nowrap',
                    }}>
                      {stage.name}
                    </div>
                    {i < stages.length - 1 && (
                      <div style={{ 
                        width: '40px', 
                        height: '2px', 
                        background: 'linear-gradient(90deg, #ff6b6b, #ff8e53)',
                        margin: '0 4px',
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Time Allocation */}
        {step === 4 && (
          <div className="card" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '40px',
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '700' }}>
              Time Allocation
            </h2>
            <p style={{ margin: '0 0 32px', color: '#94a3b8' }}>
              Enter the time (in minutes) each actor spends per customer at each stage of the journey.
            </p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                minWidth: '600px',
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '16px',
                      borderBottom: '2px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8',
                      fontWeight: '500',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>Actor</th>
                    {stages.map(stage => (
                      <th key={stage.id} style={{ 
                        textAlign: 'center', 
                        padding: '16px',
                        borderBottom: '2px solid rgba(255,255,255,0.1)',
                        color: '#ff8e53',
                        fontWeight: '600',
                        fontSize: '13px',
                      }}>{stage.name}</th>
                    ))}
                    <th style={{ 
                      textAlign: 'right', 
                      padding: '16px',
                      borderBottom: '2px solid rgba(255,255,255,0.1)',
                      color: '#6bff6b',
                      fontWeight: '600',
                      fontSize: '13px',
                    }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {actors.map(actor => (
                    <tr key={actor.id}>
                      <td style={{ 
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        fontWeight: '500',
                      }}>{actor.name}</td>
                      {stages.map(stage => (
                        <td key={stage.id} style={{ 
                          padding: '8px',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          textAlign: 'center',
                        }}>
                          <input
                            type="number"
                            value={timeMatrix[`${actor.id}-${stage.id}`] || ''}
                            onChange={(e) => updateTime(actor.id, stage.id, e.target.value)}
                            placeholder="0"
                            className="input-field"
                            style={{
                              width: '70px',
                              padding: '10px',
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '6px',
                              color: '#fff',
                              textAlign: 'center',
                              fontSize: '14px',
                              fontFamily: "'Space Mono', monospace",
                            }}
                          />
                        </td>
                      ))}
                      <td style={{ 
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        textAlign: 'right',
                        fontFamily: "'Space Mono', monospace",
                        color: '#6bff6b',
                        fontWeight: '600',
                      }}>
                        {formatCurrency(calculations.costByActor[actor.id] || 0)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(255,107,107,0.1)' }}>
                    <td style={{ 
                      padding: '16px',
                      fontWeight: '700',
                      color: '#ff6b6b',
                    }}>Cost by Stage</td>
                    {stages.map(stage => (
                      <td key={stage.id} style={{ 
                        padding: '16px',
                        textAlign: 'center',
                        fontFamily: "'Space Mono', monospace",
                        color: '#ff8e53',
                        fontWeight: '600',
                        fontSize: '13px',
                      }}>
                        {formatCurrency(calculations.costByStage[stage.id] || 0)}
                      </td>
                    ))}
                    <td style={{ 
                      padding: '16px',
                      textAlign: 'right',
                      fontFamily: "'Space Mono', monospace",
                      color: '#ff6b6b',
                      fontWeight: '700',
                      fontSize: '16px',
                    }}>
                      {formatCurrency(calculations.totalCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 5: Results */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="card" style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                borderRadius: '20px',
                padding: '28px',
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Cost to Serve</div>
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: '700',
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {formatCurrency(calculations.totalCost)}
                </div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>
                  Per transaction/service delivery
                </div>
              </div>
              
              <div className="card" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '28px',
              }}>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Cost per Customer</div>
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: '700',
                  color: '#6bff6b',
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {formatCurrency(calculations.costToServe)}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
                  Based on {customerCount.toLocaleString()} customers
                </div>
              </div>
              
              <div className="card" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '28px',
              }}>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Actors Involved</div>
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: '700',
                  color: '#fff',
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {actors.length}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
                  Across {stages.length} journey stages
                </div>
              </div>
            </div>
            
            {/* Cost by Stage Chart */}
            <div className="card" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '32px',
            }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '600' }}>
                Cost Distribution by Stage
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stages.map(stage => {
                  const cost = calculations.costByStage[stage.id] || 0;
                  const percentage = maxStageCost > 0 ? (cost / maxStageCost) * 100 : 0;
                  return (
                    <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '100px', fontSize: '14px', color: '#94a3b8' }}>{stage.name}</div>
                      <div style={{ flex: 1, height: '32px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div 
                          className="bar-animate"
                          style={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #ff6b6b, #ff8e53)',
                            borderRadius: '8px',
                          }} 
                        />
                      </div>
                      <div style={{ 
                        width: '100px', 
                        textAlign: 'right',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '14px',
                        color: '#ff8e53',
                      }}>
                        {formatCurrency(cost)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Cost by Actor Chart */}
            <div className="card" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '32px',
            }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '600' }}>
                Cost Distribution by Actor
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {actors.map(actor => {
                  const cost = calculations.costByActor[actor.id] || 0;
                  const percentage = maxActorCost > 0 ? (cost / maxActorCost) * 100 : 0;
                  return (
                    <div key={actor.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '100px', fontSize: '14px', color: '#94a3b8' }}>{actor.name}</div>
                      <div style={{ flex: 1, height: '32px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div 
                          className="bar-animate"
                          style={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #6bff6b, #4ade80)',
                            borderRadius: '8px',
                          }} 
                        />
                      </div>
                      <div style={{ 
                        width: '100px', 
                        textAlign: 'right',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '14px',
                        color: '#6bff6b',
                      }}>
                        {formatCurrency(cost)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Formula */}
            <div className="card" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '32px',
              textAlign: 'center',
            }}>
              <div style={{ 
                fontFamily: "'Space Mono', monospace",
                fontSize: '18px',
                color: '#94a3b8',
              }}>
                Cost to Serve = Total Cost of Service ÷ Number of Customers
              </div>
              <div style={{ 
                marginTop: '16px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '24px',
              }}>
                <span style={{ color: '#ff6b6b' }}>{formatCurrency(calculations.totalCost)}</span>
                <span style={{ color: '#94a3b8' }}> ÷ </span>
                <span style={{ color: '#fff' }}>{customerCount.toLocaleString()}</span>
                <span style={{ color: '#94a3b8' }}> = </span>
                <span style={{ color: '#6bff6b' }}>{formatCurrency(calculations.costToServe)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '32px',
          gap: '16px',
        }}>
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            style={{
              padding: '16px 32px',
              background: step === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: step === 0 ? '#64748b' : '#e2e8f0',
              cursor: step === 0 ? 'default' : 'pointer',
              fontSize: '15px',
              fontWeight: '500',
            }}
          >
            ← Previous
          </button>
          
          <button
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            disabled={step === steps.length - 1}
            style={{
              padding: '16px 32px',
              background: step === steps.length - 1 
                ? 'rgba(255,255,255,0.05)' 
                : 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              cursor: step === steps.length - 1 ? 'default' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
            }}
          >
            {step === steps.length - 1 ? 'Complete' : 'Next →'}
          </button>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '13px',
      }}>
        Cost to Serve Framework by Gerry Scullion - This is HCD
      </footer>
    </div>
  );
}
