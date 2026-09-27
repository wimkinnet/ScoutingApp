import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import type { ModalProps } from '../app/types';
import {
  useGetGameByIdQuery,
  useGetClubsQuery,
  useGetTeamsQuery,
  useGenerateGameReportMutation,
} from '../services/ScoutingApi';
import type { ScoutedTeam, TeamReport } from '../services/ScoutingApi';
import './GameStatsModal.css';
import './GameReportModal.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { useMediaQuery } from 'react-responsive';

function TeamReportView({ team, report }: { team: string; report: TeamReport }) {
  return (
    <section className='report-team'>
      <h2 className='report-team-name'>{team}</h2>
      {!report.scouted && <p className='report-note'>Not fully scouted: scorers only</p>}
      <p className='report-headline'>{report.headline}</p>
      <p>{report.summary}</p>
      {report.scouted && (
        <>
          <h3>Strengths</h3>
          <ul>
            {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          <h3>Weaknesses</h3>
          <ul>
            {report.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </>
      )}
      <h3>{report.scouted ? 'Key players' : 'Scorers'}</h3>
      <ul>
        {report.keyPlayers.map((p, i) => <li key={i}><strong>{p.name}</strong>: {p.note}</li>)}
      </ul>
    </section>
  );
}

export default function GameReportModal({ isOpen, onClose }: ModalProps) {
  const { id } = useSelector((s: RootState) => s.ui.gameReportModal);

  const { data: game } = useGetGameByIdQuery(id ?? '', { skip: !isOpen || !id });
  const { data: clubs } = useGetClubsQuery(undefined, { skip: !isOpen });
  const { data: teams } = useGetTeamsQuery(undefined, { skip: !isOpen });

  // Every report is a paid OpenAI call: nothing is generated until a scouted team is picked.
  // Reopening the same game shows the report we already have; "Regenerate" asks for a new one.
  const [generateReport, { data: report, isLoading, error, originalArgs }] = useGenerateGameReportMutation();
  const [isChoosingTeam, setIsChoosingTeam] = useState(false);

  const isNarrowScreen = useMediaQuery({ maxWidth: 1024 });

  const reportIsForThisGame = report?.gameId === id;
  const errorIsForThisGame = !!error && originalArgs?.id === id;

  const handleClose = () => {
    setIsChoosingTeam(false);
    onClose();
  };

  const teamName = (teamId?: string) => {
    const team = teams?.find((t) => t.id === teamId);
    const club = clubs?.find((cl) => cl.id === team?.clubId);
    return [club?.name, team?.name].filter(Boolean).join(' ');
  };
  const Home = teamName(game?.homeTeamId);
  const Away = teamName(game?.awayTeamId);

  const onGenerate = (scoutedTeam: ScoutedTeam) => {
    if (!id) return;
    setIsChoosingTeam(false);
    generateReport({ id, scoutedTeam });
  };

  const errorData = error && 'data' in error ? (error.data as { message?: string } | undefined) : undefined;
  const errorMessage = errorData?.message || 'Could not generate the report';
  const showTeamChoice = !isLoading && (isChoosingTeam || !reportIsForThisGame);

  if (!isOpen) return null;

  return (
    <div className="game-stats-modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="GameReportModalTitle">
      <div className="game-stats-modal-backdrop" onClick={handleClose} />
      <div className="game-stats-modal-content">
        <header className="game-stats-modal-header">
          <div className='game-stats-header-blank'></div>
          <div className='game-stats-header-team'>{Home}</div>
          <div className="game-stats-header-score" id="GameReportModalTitle">Report</div>
          <div className='game-stats-header-team'>{Away}</div>
          <button className="btn small" onClick={handleClose} aria-label="Close">✕</button>
        </header>
        <div className="game-stats-modal-body report-body">
          {isLoading ? (
            <p>Generating report... this can take a minute.</p>
          ) : showTeamChoice ? (
            <div className='report-choice'>
              {errorIsForThisGame && <p>{errorMessage}</p>}
              <p>Which team was fully scouted? The other team's report is limited to its scorers.</p>
              <div className='report-actions'>
                <button className="btn" onClick={() => onGenerate('home')}>{Home || 'Home'}</button>
                <button className="btn" onClick={() => onGenerate('away')}>{Away || 'Away'}</button>
              </div>
            </div>
          ) : reportIsForThisGame && report ? (
            <>
              <div className={`report-container ${isNarrowScreen ? 'column' : 'row'}`}>
                <TeamReportView team={Home} report={report.home} />
                <TeamReportView team={Away} report={report.away} />
              </div>
              <div className='report-footer'>
                Generated {new Date(report.generatedAt).toLocaleString()} with {report.model}
              </div>
              <div className='report-actions'>
                <button className="btn" onClick={() => onGenerate(report.scoutedTeam)}>Regenerate</button>
                <button className="btn" onClick={() => setIsChoosingTeam(true)}>Change scouted team</button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
