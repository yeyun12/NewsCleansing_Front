import React from 'react';
import '../../../assets/styles/AppLayout.css';
import './ReadingAnalysis.css';

import EmotionTrendGraph from './components/EmotionTrendGraph/EmotionTrendGraph';
import FieldStatBar from './components/FieldStatBar/FieldStatBar';
// ↓ 품질 점수 대신 캐릭터 카드
import DailyPersonaCard from './components/DailyPersonaCard/DailyPersonaCard';

const ReadingAnalysisPresenter = ({ usageTrend, fieldStats /*, qualityScore*/ }) => (
  <div className="app-layout reading-layout">
    <div className="reading-analysis-container reading-flush">
      <h2 className="ra-main-title">분석 요약</h2>

      <div className="ra-section">
        {/* 접속 시간대 그래프 */}
        <EmotionTrendGraph trend={usageTrend} />
      </div>

      <div className="ra-section">
        <span className="ra-subtitle">분야별 소비</span>
        <div className="ra-fields-bars">
          {fieldStats.map((stat) => (
            <FieldStatBar
              key={stat.label}
              label={stat.label}
              value={stat.value}
              count={stat.count}
            />
          ))}
        </div>
      </div>

      <div className="ra-section">
        {/* ✅ 오늘의 사용 캐릭터 */}
        <DailyPersonaCard usageTrend={usageTrend} fieldStats={fieldStats} />
      </div>
    </div>
  </div>
);

export default ReadingAnalysisPresenter;
