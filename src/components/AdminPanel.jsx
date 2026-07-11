import React, { useState } from 'react';
import Modal from './Modal';

const AdminPanel = ({ portfolioData, token, onUpdate, onLogout, addToast }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [data, setData] = useState(JSON.parse(JSON.stringify(portfolioData)));
  
  // State for adding items
  const [newSkill, setNewSkill] = useState({ category: 'languages', value: '' });
  const [newCert, setNewCert] = useState({ title: '', issuer: '', year: '' });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  // Project / Experience editing states
  const [editingProject, setEditingProject] = useState(null); // { id: ..., title: ... } or 'new'
  const [projectForm, setProjectForm] = useState({ id: '', title: '', description: '', technologies: '', category: 'Web', githubUrl: '', liveUrl: '', image: '' });
  
  const [editingExperience, setEditingExperience] = useState(null); // { id: ..., company: ... } or 'new'
  const [experienceForm, setExperienceForm] = useState({ id: '', company: '', role: '', years: '', description: '' });

  // Drag and drop image/video upload handler logic
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileUpload = (file) => {
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const isVid = file.type.startsWith('video/');
    if (!isImg && !isVid) {
      addToast('Lütfen yalnızca görsel veya video dosyası yükleyin.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast('Dosya boyutu 15MB sınırını aşamaz.', 'error');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target.result;
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            fileData: base64
          })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          setProjectForm(prev => ({ ...prev, image: result.url }));
          addToast('Medya başarıyla yüklendi.', 'success');
        } else {
          addToast(result.message || 'Yükleme başarısız oldu.', 'error');
        }
      } catch (err) {
        console.error(err);
        addToast('Dosya yüklenirken bağlantı hatası oluştu.', 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  // Save full portfolio data
  const handleSave = async (updatedData = data) => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Güncelleme başarısız oldu.');
      }

      onUpdate(resJson.data);
      setData(resJson.data);
      addToast('Portföy başarıyla güncellendi!', 'success');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  // General Text Updates
  const handleTextChange = (section, field, value) => {
    setData(prev => {
      const copy = { ...prev };
      if (section) {
        copy[section] = { ...copy[section], [field]: value };
      } else {
        copy[field] = value;
      }
      return copy;
    });
  };

  // Skill Management
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.value.trim()) return;

    const updated = { ...data };
    if (!updated.skills[newSkill.category]) {
      updated.skills[newSkill.category] = [];
    }
    updated.skills[newSkill.category].push(newSkill.value.trim());
    
    setData(updated);
    setNewSkill(prev => ({ ...prev, value: '' }));
    handleSave(updated);
  };

  const handleRemoveSkill = (category, idx) => {
    const updated = { ...data };
    updated.skills[category].splice(idx, 1);
    setData(updated);
    handleSave(updated);
  };

  // Certificate Management
  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCert.title || !newCert.issuer || !newCert.year) {
      addToast('Lütfen sertifika bilgilerini eksiksiz doldurun.', 'error');
      return;
    }

    const updated = { ...data };
    const certItem = {
      id: `cert-${Date.now()}`,
      title: newCert.title.trim(),
      issuer: newCert.issuer.trim(),
      year: newCert.year.trim()
    };
    
    updated.certificates.push(certItem);
    setData(updated);
    setNewCert({ title: '', issuer: '', year: '' });
    handleSave(updated);
  };

  const handleRemoveCert = (id) => {
    const updated = { ...data };
    updated.certificates = updated.certificates.filter(c => c.id !== id);
    setData(updated);
    handleSave(updated);
  };

  // Project Management Dialog
  const openProjectModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({
        id: proj.id,
        title: proj.title,
        description: proj.description,
        technologies: proj.technologies.join(', '),
        category: proj.category || 'Web',
        githubUrl: proj.githubUrl || '',
        liveUrl: proj.liveUrl || '',
        image: proj.image || ''
      });
    } else {
      setEditingProject('new');
      setProjectForm({
        id: `proj-${Date.now()}`,
        title: '',
        description: '',
        technologies: '',
        category: 'Web',
        githubUrl: '',
        liveUrl: '',
        image: ''
      });
    }
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) {
      addToast('Proje başlığı ve açıklaması zorunludur.', 'error');
      return;
    }

    const techArray = projectForm.technologies
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    const projectItem = {
      ...projectForm,
      technologies: techArray
    };

    const updated = { ...data };
    if (editingProject === 'new') {
      updated.projects.push(projectItem);
    } else {
      updated.projects = updated.projects.map(p => p.id === projectForm.id ? projectItem : p);
    }

    setData(updated);
    setEditingProject(null);
    handleSave(updated);
  };

  const handleRemoveProject = (id) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      const updated = { ...data };
      updated.projects = updated.projects.filter(p => p.id !== id);
      setData(updated);
      handleSave(updated);
    }
  };

  // Experience Management Dialog
  const openExperienceModal = (exp = null) => {
    if (exp) {
      setEditingExperience(exp);
      setExperienceForm({ ...exp });
    } else {
      setEditingExperience('new');
      setExperienceForm({
        id: `exp-${Date.now()}`,
        company: '',
        role: '',
        years: '',
        description: ''
      });
    }
  };

  const handleExperienceSubmit = (e) => {
    e.preventDefault();
    if (!experienceForm.company || !experienceForm.role || !experienceForm.years) {
      addToast('Firma adı, rol ve yıllar alanları zorunludur.', 'error');
      return;
    }

    const updated = { ...data };
    if (editingExperience === 'new') {
      updated.experience.push(experienceForm);
    } else {
      updated.experience = updated.experience.map(e => e.id === experienceForm.id ? experienceForm : e);
    }

    setData(updated);
    setEditingExperience(null);
    handleSave(updated);
  };

  const handleRemoveExperience = (id) => {
    if (window.confirm('Bu deneyimi silmek istediğinizden emin misiniz?')) {
      const updated = { ...data };
      updated.experience = updated.experience.filter(e => e.id !== id);
      setData(updated);
      handleSave(updated);
    }
  };

  // Password Change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      addToast('Lütfen tüm şifre alanlarını doldurun.', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Yeni şifreler eşleşmiyor.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Şifre değiştirilemedi.');
      }

      addToast('Şifreniz başarıyla güncellendi!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="admin-panel-container">
      <div className="container py-8">
        <div className="admin-header glass-card mb-6">
          <div className="header-info">
            <h2 className="admin-title font-orbitron text-gradient">Yönetim Paneli</h2>
            <p className="admin-subtitle">Sitenizin içeriğini buradan düzenleyin</p>
          </div>
          <div className="header-actions">
            <button onClick={onLogout} className="btn btn-secondary">Oturumu Kapat</button>
          </div>
        </div>

        <div className="admin-grid">
          {/* Sidebar Tabs */}
          <div className="admin-sidebar glass-card">
            <button 
              onClick={() => setActiveTab('general')} 
              className={`sidebar-tab ${activeTab === 'general' ? 'active' : ''}`}
            >
              <span>👤</span> Genel Bilgiler
            </button>
            <button 
              onClick={() => setActiveTab('skills')} 
              className={`sidebar-tab ${activeTab === 'skills' ? 'active' : ''}`}
            >
              <span>⚡</span> Yetenekler & Sertifikalar
            </button>
            <button 
              onClick={() => setActiveTab('experience')} 
              className={`sidebar-tab ${activeTab === 'experience' ? 'active' : ''}`}
            >
              <span>💼</span> İş Deneyimleri
            </button>
            <button 
              onClick={() => setActiveTab('projects')} 
              className={`sidebar-tab ${activeTab === 'projects' ? 'active' : ''}`}
            >
              <span>🎨</span> Projeler
            </button>
            <button 
              onClick={() => setActiveTab('security')} 
              className={`sidebar-tab ${activeTab === 'security' ? 'active' : ''}`}
            >
              <span>🔒</span> Güvenlik
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="admin-content-card glass-card">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="tab-pane">
                <h3 className="tab-title font-orbitron text-gradient mb-4">Genel Hakkımda Bilgileri</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Adınız Soyadınız</label>
                      <input 
                        type="text" 
                        value={data.about.name || ''} 
                        onChange={(e) => handleTextChange('about', 'name', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Ünvanınız</label>
                      <input 
                        type="text" 
                        value={data.about.title || ''} 
                        onChange={(e) => handleTextChange('about', 'title', e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Profesyonel Özet / Biyografi</label>
                    <textarea 
                      value={data.about.summary || ''} 
                      onChange={(e) => handleTextChange('about', 'summary', e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>E-Posta</label>
                      <input 
                        type="email" 
                        value={data.about.email || ''} 
                        onChange={(e) => handleTextChange('about', 'email', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>LinkedIn Linki</label>
                      <input 
                        type="text" 
                        value={data.about.linkedin || ''} 
                        onChange={(e) => handleTextChange('about', 'linkedin', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>GitHub Linki</label>
                      <input 
                        type="text" 
                        value={data.about.github || ''} 
                        onChange={(e) => handleTextChange('about', 'github', e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Konum</label>
                    <input 
                      type="text" 
                      value={data.about.location || ''} 
                      onChange={(e) => handleTextChange('about', 'location', e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <hr className="my-6 border-zinc-800" />
                  
                  <h3 className="tab-title font-orbitron text-gradient-purple mb-4">Eğitim Bilgileri</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Okul Adı</label>
                      <input 
                        type="text" 
                        value={data.education?.school || ''} 
                        onChange={(e) => handleTextChange('education', 'school', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bölüm</label>
                      <input 
                        type="text" 
                        value={data.education?.department || ''} 
                        onChange={(e) => handleTextChange('education', 'department', e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Eğitim Yılları</label>
                      <input 
                        type="text" 
                        value={data.education?.years || ''} 
                        onChange={(e) => handleTextChange('education', 'years', e.target.value)}
                        className="form-control"
                        placeholder="Örn: 2022 - 2026"
                      />
                    </div>
                    <div className="form-group">
                      <label>Genel Not Ortalaması (GPA)</label>
                      <input 
                        type="text" 
                        value={data.education?.gpa || ''} 
                        onChange={(e) => handleTextChange('education', 'gpa', e.target.value)}
                        className="form-control"
                        placeholder="Örn: 3.10/4.00"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary mt-4">Genel Bilgileri Kaydet</button>
                </form>
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
              <div className="tab-pane">
                <h3 className="tab-title font-orbitron text-gradient mb-4">Yetenek Listesi Yönetimi</h3>
                
                {/* Add Skill Tag */}
                <form onSubmit={handleAddSkill} className="add-skill-form glass-card p-4 mb-6">
                  <h4 className="subcard-title mb-2">Yetenek Ekle</h4>
                  <div className="grid-3 items-end gap-4">
                    <div className="form-group mb-0">
                      <label>Kategori</label>
                      <select 
                        value={newSkill.category}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                        className="form-control"
                      >
                        <option value="languages">Diller (Languages)</option>
                        <option value="frameworks">Frameworks & Libraries</option>
                        <option value="databases">Veri Tabanı (Databases)</option>
                        <option value="tools">Araçlar & Metotlar (Tools)</option>
                      </select>
                    </div>
                    <div className="form-group mb-0">
                      <label>Yetenek Adı</label>
                      <input 
                        type="text"
                        value={newSkill.value}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, value: e.target.value }))}
                        className="form-control"
                        placeholder="Örn: Docker"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary mb-1">Ekle</button>
                  </div>
                </form>

                {/* Show skills with remove icons */}
                <div className="skills-manager-list">
                  {Object.keys(data.skills).map((cat) => (
                    <div key={cat} className="skill-cat-edit mb-4">
                      <h4 className="skill-cat-title capitalize font-mono text-gradient-purple mb-2">
                        {cat === 'languages' ? 'Diller' : cat === 'frameworks' ? 'Frameworkler' : cat === 'databases' ? 'Veri Tabanları' : 'Araçlar'}
                      </h4>
                      <div className="skill-tags">
                        {data.skills[cat]?.map((skill, idx) => (
                          <span key={idx} className="tech-badge pr-1 flex items-center gap-2">
                            {skill}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSkill(cat, idx)} 
                              className="text-red-500 hover:text-red-700 bg-transparent border-0 font-bold cursor-pointer text-xs ml-1"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-6 border-zinc-800" />

                {/* CERTIFICATES SUB-SECTION */}
                <h3 className="tab-title font-orbitron text-gradient mb-4">Sertifikalar</h3>
                
                <form onSubmit={handleAddCert} className="add-cert-form glass-card p-4 mb-4">
                  <h4 className="subcard-title mb-2">Yeni Sertifika Ekle</h4>
                  <div className="grid-3 items-end gap-4">
                    <div className="form-group mb-0">
                      <label>Sertifika Adı</label>
                      <input 
                        type="text"
                        value={newCert.title}
                        onChange={(e) => setNewCert(prev => ({ ...prev, title: e.target.value }))}
                        className="form-control"
                        placeholder="Örn: Machine Learning"
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label>Veren Kurum</label>
                      <input 
                        type="text"
                        value={newCert.issuer}
                        onChange={(e) => setNewCert(prev => ({ ...prev, issuer: e.target.value }))}
                        className="form-control"
                        placeholder="Örn: Miuul"
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label>Yıl</label>
                      <input 
                        type="text"
                        value={newCert.year}
                        onChange={(e) => setNewCert(prev => ({ ...prev, year: e.target.value }))}
                        className="form-control"
                        placeholder="Örn: 2024"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-4">Sertifikayı Listeye Ekle</button>
                </form>

                <div className="certificates-manager-list mt-4">
                  <table className="admin-table w-full text-left font-sans">
                    <thead>
                      <tr>
                        <th>Sertifika</th>
                        <th>Verici</th>
                        <th>Yıl</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.certificates?.map((cert) => (
                        <tr key={cert.id}>
                          <td>{cert.title}</td>
                          <td>{cert.issuer}</td>
                          <td>{cert.year}</td>
                          <td>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveCert(cert.id)} 
                              className="btn btn-danger py-1 px-3 text-xs"
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* EXPERIENCE TAB */}
            {activeTab === 'experience' && (
              <div className="tab-pane">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="tab-title font-orbitron text-gradient">Kariyer / İş Deneyimi Geçmişi</h3>
                  <button onClick={() => openExperienceModal()} className="btn btn-primary">Yeni Deneyim Ekle</button>
                </div>

                <div className="experience-manager-list">
                  {data.experience?.map((exp) => (
                    <div key={exp.id} className="admin-item-row glass-card p-4 mb-3 flex justify-between items-center">
                      <div className="row-info">
                        <h4 className="row-title font-bold text-white">{exp.role}</h4>
                        <p className="row-subtitle text-xs text-muted font-mono">{exp.company} | {exp.years}</p>
                      </div>
                      <div className="row-actions flex gap-2">
                        <button onClick={() => openExperienceModal(exp)} className="btn btn-secondary py-1 px-3 text-xs">Düzenle</button>
                        <button onClick={() => handleRemoveExperience(exp.id)} className="btn btn-danger py-1 px-3 text-xs">Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div className="tab-pane">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="tab-title font-orbitron text-gradient">Proje Portföyü</h3>
                  <button onClick={() => openProjectModal()} className="btn btn-primary">Yeni Proje Ekle</button>
                </div>

                <div className="projects-manager-list">
                  {data.projects?.map((proj) => (
                    <div key={proj.id} className="admin-item-row glass-card p-4 mb-3 flex justify-between items-center">
                      <div className="row-info">
                        <h4 className="row-title font-bold text-white">{proj.title}</h4>
                        <p className="row-subtitle text-xs text-muted font-mono">{proj.category} | {proj.technologies.slice(0, 4).join(', ')}</p>
                      </div>
                      <div className="row-actions flex gap-2">
                        <button onClick={() => openProjectModal(proj)} className="btn btn-secondary py-1 px-3 text-xs">Düzenle</button>
                        <button onClick={() => handleRemoveProject(proj.id)} className="btn btn-danger py-1 px-3 text-xs">Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="tab-pane">
                <h3 className="tab-title font-orbitron text-gradient mb-4">Yönetici Şifresini Değiştir</h3>
                <form onSubmit={handlePasswordChange} className="max-w-md">
                  <div className="form-group">
                    <label>Mevcut Şifre</label>
                    <input 
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="form-control"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Yeni Şifre</label>
                    <input 
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Yeni Şifre (Tekrar)</label>
                    <input 
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="form-control"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary mt-2">Şifreyi Güncelle</button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* PROJECT DIALOG MODAL */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title={editingProject === 'new' ? 'Yeni Proje Ekle' : 'Projeyi Düzenle'}
      >
        <form onSubmit={handleProjectSubmit} className="admin-dialog-form">
          <div className="form-group">
            <label>Proje Başlığı *</label>
            <input 
              type="text"
              value={projectForm.title}
              onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
              className="form-control"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Kategori</label>
              <select 
                value={projectForm.category}
                onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                className="form-control"
              >
                <option value="Web">Web</option>
                <option value="AI">AI (Yapay Zekâ)</option>
                <option value="Mobile">Mobil</option>
                <option value="Other">Diğer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Teknolojiler (Virgülle ayırın)</label>
              <input 
                type="text"
                value={projectForm.technologies}
                onChange={(e) => setProjectForm(prev => ({ ...prev, technologies: e.target.value }))}
                className="form-control"
                placeholder="Örn: React, Node.js, Firebase"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Proje Açıklaması *</label>
            <textarea 
              value={projectForm.description}
              onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
              className="form-control"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>GitHub Linki</label>
              <input 
                type="text"
                value={projectForm.githubUrl}
                onChange={(e) => setProjectForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                className="form-control"
                placeholder="https://github.com/..."
              />
            </div>
            <div className="form-group">
              <label>Canlı Link</label>
              <input 
                type="text"
                value={projectForm.liveUrl}
                onChange={(e) => setProjectForm(prev => ({ ...prev, liveUrl: e.target.value }))}
                className="form-control"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Proje Görseli / Videosu (Sürükle & Bırak veya Seç)</label>
            <div 
              className={`media-upload-zone ${isDragging ? 'dragging' : ''} ${projectForm.image ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div className="upload-loading-spinner font-mono text-xs text-gradient">
                  YÜKLENİYOR...
                </div>
              ) : projectForm.image ? (
                <div className="upload-preview-container">
                  {projectForm.image.endsWith('.mp4') || projectForm.image.endsWith('.webm') || projectForm.image.startsWith('data:video') ? (
                    <video src={projectForm.image} className="upload-preview-media" muted loop autoPlay />
                  ) : (
                    <img src={projectForm.image} className="upload-preview-media" alt="Önizleme" />
                  )}
                  <div className="upload-preview-overlay">
                    <span className="file-url text-xs font-mono text-white">{projectForm.image.substring(0, 30)}...</span>
                    <button 
                      type="button" 
                      onClick={() => setProjectForm(prev => ({ ...prev, image: '' }))} 
                      className="btn-remove-media font-mono"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-prompt font-mono text-xs">
                  <span>Dosyaları Buraya Sürükleyin</span>
                  <span>veya</span>
                  <label className="file-select-label">
                    Bilgisayardan Seç
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <input 
                type="text"
                value={projectForm.image}
                onChange={(e) => setProjectForm(prev => ({ ...prev, image: e.target.value }))}
                className="form-control text-xs font-mono"
                placeholder="Veya manuel link girin: https://..."
              />
            </div>
          </div>

          <div className="dialog-actions flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setEditingProject(null)} className="btn btn-secondary">İptal</button>
            <button type="submit" className="btn btn-primary">Kaydet</button>
          </div>
        </form>
      </Modal>

      {/* EXPERIENCE DIALOG MODAL */}
      <Modal
        isOpen={!!editingExperience}
        onClose={() => setEditingExperience(null)}
        title={editingExperience === 'new' ? 'Yeni İş Deneyimi Ekle' : 'İş Deneyimini Düzenle'}
      >
        <form onSubmit={handleExperienceSubmit} className="admin-dialog-form">
          <div className="grid-2">
            <div className="form-group">
              <label>Şirket / Kurum Adı *</label>
              <input 
                type="text"
                value={experienceForm.company}
                onChange={(e) => setEditingExperience(prev => {
                  setExperienceForm(f => ({ ...f, company: e.target.value }));
                  return prev;
                })}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Rol / Pozisyon *</label>
              <input 
                type="text"
                value={experienceForm.role}
                onChange={(e) => setEditingExperience(prev => {
                  setExperienceForm(f => ({ ...f, role: e.target.value }));
                  return prev;
                })}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Çalışılan Yıllar *</label>
            <input 
              type="text"
              value={experienceForm.years}
              onChange={(e) => setEditingExperience(prev => {
                setExperienceForm(f => ({ ...f, years: e.target.value }));
                return prev;
              })}
              className="form-control"
              placeholder="Örn: 2024 - 2025"
              required
            />
          </div>

          <div className="form-group">
            <label>Açıklama / Görevler *</label>
            <textarea 
              value={experienceForm.description}
              onChange={(e) => setEditingExperience(prev => {
                setExperienceForm(f => ({ ...f, description: e.target.value }));
                return prev;
              })}
              className="form-control"
              required
            />
          </div>

          <div className="dialog-actions flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setEditingExperience(null)} className="btn btn-secondary">İptal</button>
            <button type="submit" className="btn btn-primary">Kaydet</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AdminPanel;
