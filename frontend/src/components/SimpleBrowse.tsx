import React from 'react';

const SimpleBrowse: React.FC = () => {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f8fafc',
      minHeight: 'calc(100vh - 80px)'
    }}>
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        textAlign: 'center',
        border: '2px solid #10b981'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>
          🔍 둘러보기 - 성공적으로 로드됨!
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          새로운 Browse 페이지가 성공적으로 구현되었습니다.
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                👤
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#1f2937' }}>테스트 사용자 {i}</h3>
                <p style={{ margin: 0, color: '#3b82f6', fontSize: '0.9rem' }}>AI 개발자</p>
              </div>
            </div>
            
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              AI와 머신러닝을 활용한 혁신적인 솔루션을 개발하고 있습니다.
            </p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {['Python', 'React', 'AI'].map(skill => (
                <span key={skill} style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#e0f2fe',
                  color: '#0277bd',
                  borderRadius: '12px',
                  fontSize: '0.75rem'
                }}>
                  {skill}
                </span>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                <span>❤️ {10 + i * 5}</span>
                <span>👥 {20 + i * 3}</span>
              </div>
              <button style={{
                padding: '0.5rem 1rem',
                border: '1px solid #3b82f6',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}>
                프로필 보기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleBrowse;