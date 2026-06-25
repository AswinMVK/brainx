import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import api from '../api';
import logo from '../assets/logo.png';

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('user');
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' | 'email'
  const [aadhaar, setAadhaar] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const toast = useRef(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(logoRef.current, { y: -8, duration: 0.6, ease: 'back.out(1.7)' })
      .from(cardRef.current, { y: 50, duration: 0.7, ease: 'power3.out' }, '-=0.3');
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = async () => {
    if (!aadhaar || aadhaar.length !== 12) {
      toast.current.show({ severity: 'warn', summary: 'Invalid Aadhaar', detail: 'Enter a valid 12-digit Aadhaar number.', life: 3000 });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/send_otp', { aadhaar_number: aadhaar });
      setOtpSent(true);
      setMaskedPhone(res.data.masked_phone || '');
      setDemoOtp(res.data.demo_otp || '');
      setOtp('');
      setCountdown(30);
      toast.current.show({ severity: 'success', summary: 'OTP Sent', detail: res.data.message, life: 4000 });
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to send OTP';
      toast.current.show({ severity: 'error', summary: 'Error', detail: msg, life: 3000 });
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.current.show({ severity: 'warn', summary: 'Enter OTP', detail: 'Please enter the 6-digit OTP.', life: 3000 });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify_otp', { aadhaar_number: aadhaar, otp });
      onLogin({ ...res.data, is_admin: false });
    } catch (e) {
      const msg = e.response?.data?.error || 'OTP verification failed';
      toast.current.show({ severity: 'error', summary: 'Invalid OTP', detail: msg, life: 3000 });
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const digits = otp.split('');
    while (digits.length < 6) digits.push('');
    digits[index] = value;
    setOtp(digits.join(''));
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && otp.length === 6) verifyOtp();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pasted);
    if (pasted.length === 6) otpRefs.current[5]?.focus();
  };

  const loginUser = async () => {
    if (!aadhaar || !email) {
      toast.current.show({ severity: 'warn', summary: 'Missing Fields', detail: 'Please fill in all fields.', life: 3000 });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { aadhaar_number: aadhaar, email });
      onLogin({ ...res.data, is_admin: false });
    } catch {
      toast.current.show({ severity: 'error', summary: 'Login Failed', detail: 'Invalid Aadhaar or email.', life: 3000 });
    } finally { setLoading(false); }
  };

  const loginAdmin = async () => {
    if (!adminUser || !adminPass) {
      toast.current.show({ severity: 'warn', summary: 'Missing Fields', detail: 'Please fill in all fields.', life: 3000 });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/admin_login', { username: adminUser, password: adminPass });
      onLogin({ ...res.data, is_admin: true });
    } catch {
      toast.current.show({ severity: 'error', summary: 'Login Failed', detail: 'Invalid admin credentials.', life: 3000 });
    } finally { setLoading(false); }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: 10,
    padding: '11px 14px',
    width: '100%',
    fontSize: 14,
    outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0a2744 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <Toast ref={toast} position="top-right" />

      {/* Animated background orbs */}
      {[
        { size: 400, top: '-10%', left: '-10%', color: '#3b82f6', delay: '0s' },
        { size: 300, top: '60%', right: '-5%', color: '#1d4ed8', delay: '2s' },
        { size: 200, top: '30%', left: '60%', color: '#0ea5e9', delay: '4s' },
      ].map((orb, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: orb.size, height: orb.size,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${orb.color}25, transparent 70%)`,
          top: orb.top, left: orb.left, right: orb.right,
          animation: `orbFloat 8s ease-in-out infinite alternate`,
          animationDelay: orb.delay,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460, margin: '0 2rem' }}>
        {/* Logo */}
        <div ref={logoRef} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src={logo} alt="DigiVerify" style={{ height: 72, margin: '0 auto 12px', display: 'block', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.6))' }} />
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 28, margin: 0, letterSpacing: '-0.5px' }}>Digi Verify</h1>
          <p style={{ color: 'rgba(147,197,253,0.8)', fontSize: 13, marginTop: 4 }}>Government Scheme Verification System</p>
        </div>

        {/* Glass Card */}
        <div ref={cardRef} style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          padding: '2.5rem 2.5rem 2rem',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex', borderRadius: 12, overflow: 'hidden', marginBottom: '1.75rem',
            background: 'rgba(255,255,255,0.06)', padding: 4, gap: 4,
          }}>
            {[['user', 'pi-user', 'Citizen Login'], ['admin', 'pi-shield', 'Admin Login']].map(([key, icon, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px 0', fontWeight: 700, fontSize: 13,
                border: 'none', cursor: 'pointer', borderRadius: 9,
                background: tab === key ? 'rgba(59,130,246,0.85)' : 'transparent',
                color: tab === key ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s ease',
                boxShadow: tab === key ? '0 4px 12px rgba(59,130,246,0.4)' : 'none',
              }}>
                <i className={`pi ${icon}`} style={{ fontSize: 13 }} />{label}
              </button>
            ))}
          </div>

          {tab === 'user' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* ── Method toggle ── */}
              <div style={{
                display: 'flex', borderRadius: 10, overflow: 'hidden',
                background: 'rgba(255,255,255,0.06)', padding: 3, gap: 3,
              }}>
                {[['otp', 'pi-mobile', 'OTP Verification'], ['email', 'pi-envelope', 'Email Login']].map(([key, icon, label]) => (
                  <button key={key} onClick={() => { setLoginMethod(key); setOtpSent(false); setOtp(''); setDemoOtp(''); }} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 0', fontWeight: 600, fontSize: 12,
                    border: 'none', cursor: 'pointer', borderRadius: 8,
                    background: loginMethod === key ? 'rgba(59,130,246,0.7)' : 'transparent',
                    color: loginMethod === key ? '#fff' : 'rgba(255,255,255,0.45)',
                    transition: 'all 0.2s ease',
                  }}>
                    <i className={`pi ${icon}`} style={{ fontSize: 12 }} />{label}
                  </button>
                ))}
              </div>

              {/* Aadhaar input — always visible */}
              <div>
                <label style={{ color: 'rgba(147,197,253,0.9)', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>
                  <i className="pi pi-id-card" style={{ marginRight: 6 }} />AADHAAR NUMBER
                </label>
                <InputText value={aadhaar} onChange={(e) => { setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12)); if (otpSent) { setOtpSent(false); setOtp(''); } }}
                  placeholder="12-digit Aadhaar number" maxLength={12} style={inputStyle}
                  onKeyDown={(e) => e.key === 'Enter' && loginMethod === 'otp' && !otpSent && sendOtp()}
                  disabled={otpSent && loginMethod === 'otp'} />
              </div>

              {loginMethod === 'email' ? (
                /* ── Email login mode ── */
                <>
                  <div>
                    <label style={{ color: 'rgba(147,197,253,0.9)', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>
                      <i className="pi pi-envelope" style={{ marginRight: 6 }} />EMAIL ADDRESS
                    </label>
                    <InputText value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com" type="email" style={inputStyle}
                      onKeyDown={(e) => e.key === 'Enter' && loginUser()} />
                  </div>
                  <Button label={loading ? 'Signing In...' : 'Sign In with Email'} icon="pi pi-sign-in"
                    loading={loading} onClick={loginUser}
                    disabled={!aadhaar || !email}
                    style={{
                      background: (aadhaar && email) ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.1)',
                      border: 'none', borderRadius: 10, padding: '13px',
                      fontWeight: 700, fontSize: 15, width: '100%',
                      boxShadow: (aadhaar && email) ? '0 4px 20px rgba(59,130,246,0.4)' : 'none',
                      color: (aadhaar && email) ? '#fff' : 'rgba(255,255,255,0.4)',
                    }} />
                  <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, color: 'rgba(147,197,253,0.7)', fontSize: 12 }}>
                    Test: Aadhaar <span style={{ color: '#93c5fd', fontWeight: 700 }}>123456789012</span> / Email <span style={{ color: '#93c5fd', fontWeight: 700 }}>ravi@mail.com</span>
                  </div>
                </>
              ) : !otpSent ? (
                /* ── OTP Step 1: Send OTP ── */
                <>
                  <Button label={loading ? 'Sending OTP...' : 'Send OTP'} icon="pi pi-mobile"
                    loading={loading} onClick={sendOtp}
                    disabled={aadhaar.length !== 12}
                    style={{
                      background: aadhaar.length === 12 ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.1)',
                      border: 'none', borderRadius: 10, padding: '13px',
                      fontWeight: 700, fontSize: 15, width: '100%',
                      boxShadow: aadhaar.length === 12 ? '0 4px 20px rgba(59,130,246,0.4)' : 'none',
                      color: aadhaar.length === 12 ? '#fff' : 'rgba(255,255,255,0.4)',
                    }} />
                  <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, color: 'rgba(147,197,253,0.7)', fontSize: 12 }}>
                    An OTP will be sent to your registered mobile number
                  </div>
                </>
              ) : (
                /* ── Step 2: Enter & Verify OTP ── */
                <>
                  <div style={{
                    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
                    color: '#86efac', fontSize: 13,
                  }}>
                    <i className="pi pi-check-circle" style={{ fontSize: 16 }} />
                    OTP sent to {maskedPhone}
                  </div>

                  <div>
                    <label style={{ color: 'rgba(147,197,253,0.9)', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 10, letterSpacing: '0.5px', textAlign: 'center' }}>
                      <i className="pi pi-lock" style={{ marginRight: 6 }} />ENTER 6-DIGIT OTP
                    </label>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={handleOtpPaste}>
                      {[0,1,2,3,4,5].map(i => (
                        <input key={i}
                          ref={el => otpRefs.current[i] = el}
                          type="text" inputMode="numeric" maxLength={1}
                          value={otp[i] || ''}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          style={{
                            width: 46, height: 54, textAlign: 'center',
                            fontSize: 22, fontWeight: 800, letterSpacing: 0,
                            background: otp[i] ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)',
                            border: `2px solid ${otp[i] ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.2)'}`,
                            borderRadius: 10, color: '#fff', outline: 'none',
                            transition: 'all 0.15s',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Demo hint */}
                  {demoOtp && (
                    <div style={{
                      textAlign: 'center', color: 'rgba(147,197,253,0.6)', fontSize: 11,
                      background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 10px',
                    }}>
                      <i className="pi pi-info-circle" style={{ marginRight: 4 }} />
                      Demo OTP: <span style={{ color: '#93c5fd', fontWeight: 700, letterSpacing: 3 }}>{demoOtp}</span>
                    </div>
                  )}

                  <Button label={loading ? 'Verifying...' : 'Verify & Sign In'} icon="pi pi-sign-in"
                    loading={loading} onClick={verifyOtp}
                    disabled={otp.length !== 6}
                    style={{
                      background: otp.length === 6 ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.1)',
                      border: 'none', borderRadius: 10, padding: '13px',
                      fontWeight: 700, fontSize: 15, width: '100%',
                      boxShadow: otp.length === 6 ? '0 4px 20px rgba(34,197,94,0.4)' : 'none',
                      color: otp.length === 6 ? '#fff' : 'rgba(255,255,255,0.4)',
                    }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => { setOtpSent(false); setOtp(''); setDemoOtp(''); }} style={{
                      background: 'none', border: 'none', color: 'rgba(147,197,253,0.7)', fontSize: 12,
                      cursor: 'pointer', textDecoration: 'underline',
                    }}>
                      <i className="pi pi-arrow-left" style={{ marginRight: 4, fontSize: 10 }} />Change Aadhaar
                    </button>
                    <button onClick={sendOtp} disabled={countdown > 0}
                      style={{
                        background: 'none', border: 'none', fontSize: 12, cursor: countdown > 0 ? 'default' : 'pointer',
                        color: countdown > 0 ? 'rgba(255,255,255,0.3)' : '#93c5fd',
                        textDecoration: countdown > 0 ? 'none' : 'underline',
                      }}>
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: 'rgba(147,197,253,0.9)', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>
                  <i className="pi pi-user" style={{ marginRight: 6 }} />USERNAME
                </label>
                <InputText value={adminUser} onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin" style={inputStyle} />
              </div>
              <div>
                <label style={{ color: 'rgba(147,197,253,0.9)', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>
                  <i className="pi pi-lock" style={{ marginRight: 6 }} />PASSWORD
                </label>
                <InputText value={adminPass} onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="admin password" type="password" style={inputStyle}
                  onKeyDown={(e) => e.key === 'Enter' && loginAdmin()} />
              </div>
              <Button label={loading ? 'Signing In...' : 'Sign In as Admin'} icon="pi pi-shield"
                loading={loading} onClick={loginAdmin} style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none', borderRadius: 10, padding: '13px',
                  fontWeight: 700, fontSize: 15, width: '100%',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
                }} />
              <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, color: 'rgba(147,197,253,0.7)', fontSize: 12 }}>
                Credentials: <span style={{ color: '#93c5fd', fontWeight: 700 }}>admin</span> / <span style={{ color: '#93c5fd', fontWeight: 700 }}>admin123</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes orbFloat {
          from { transform: translateY(0px) scale(1); }
          to { transform: translateY(-40px) scale(1.08); }
        }
        .p-inputtext { font-family: inherit !important; }
        .p-inputtext::placeholder { color: rgba(255,255,255,0.35) !important; }
      `}</style>
    </div>
  );
}
