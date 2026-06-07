import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { useAddLogMutation, useGetPlayerByIdQuery } from '../services/ScoutingApi';
import type { LogType } from '../app/types';
import type { ModalProps } from '../app/types';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function LogModal({ isOpen, onClose }: ModalProps) {
  const { game, player, posX, posY, possession, direction, quarter, secRem } = useSelector((s: RootState) => s.ui.actionModal);

  const ActionTypes: LogType[] = [
    { "id": 1, "name": "1pt score", "label": "1pt" },
    { "id": 2, "name": "1pt miss", "label": "1att" },
    { "id": 3, "name": "2pt score", "label": "2pt" },
    { "id": 4, "name": "2pt miss", "label": "2att" },
    { "id": 5, "name": "3pt score", "label": "3pt" },
    { "id": 6, "name": "3pt miss", "label": "3att" },
    { "id": 7, "name": "Assist", "label": "Ass" },
    { "id": 8, "name": "Turnover", "label": "TO" },
    { "id": 9, "name": "Steal", "label": "ST" },
    { "id": 10, "name": "Block", "label": "BL" },
    { "id": 11, "name": "Offensive rebound", "label": "OR" },
    { "id": 12, "name": "Defensive rebound", "label": "DR" },
    { "id": 13, "name": "Foul", "label": "F" },
    { "id": 14, "name": "Foul 1ft", "label": "F1" },
    { "id": 15, "name": "Foul 2ft", "label": "F2" },
    { "id": 16, "name": "Foul 3ft", "label": "F3" },
    { "id": 17, "name": "Offensive foul", "label": "OF" },
    { "id": 18, "name": "Technical foul", "label": "TF" },
    { "id": 19, "name": "Unsportmanlike foul", "label": "UF" },
    { "id": 20, "name": "Exclusion foul", "label": "EF" },
  ];

  const { data: playerdb } = useGetPlayerByIdQuery(player?.playerId ?? '', {
    skip: !isOpen || !player?.playerId,
  });
  
  const allActions = ActionTypes.map((a) => a.id);
  const [probableActions, setProbableActions] = useState<number[]>([]);
  const [otherActions, setOtherActions] = useState<number[]>([]);
  const [isLeft, setIsLeft] = useState<boolean>(false);

  const [addLog] = useAddLogMutation();

  useEffect(() => {
    if (!isOpen) return;
    setProbableActions([]);
    setOtherActions([]);
  }, [isOpen]);

  const onSave = async (e: any) => {
    const action = e.target.id;
    const payload = {
	    gameId: game,
	    actionId: action,
	    playerId: player?.playerId,
	    positionX: posX || 0,
	    positionY: posY || 0,
	    quarter: quarter || 0,
	    secRem: secRem || 0,
    };

    try {
      await addLog(payload as any).unwrap();
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Could not save action');
    }
  };

  useEffect(() => {
    let isLeftValue = (posX && posX < 14) ? true : false;
    setIsLeft(isLeftValue);
    console.log(player?.homeTeam, posX, posY, possession, direction, quarter, secRem);
    const defensiveCourtIsLeft = (player?.homeTeam && direction === "Left") || (!(player?.homeTeam) && direction === "Right");
    const outTreePointCircleLeft = ((posX && posY) ? (((posX - 1.60) ** 2 + (posY - 7.5) ** 2 > (6.75 ** 2)) && (posX > 1.60)) : false);
    const outTreePointCircleRight = ((posX && posY) ? (((26.40 - posX) ** 2 + (posY - 7.5) ** 2 > (6.75 ** 2)) && (posX < 26.40)) : false);
    const outTreePointCircle = (outTreePointCircleLeft && !(defensiveCourtIsLeft)) || (outTreePointCircleRight && defensiveCourtIsLeft);
    const outTreePointCircleDefensive = (outTreePointCircleLeft && defensiveCourtIsLeft) || (outTreePointCircleRight && !(defensiveCourtIsLeft));
    const aboveThreePoint = ((posX && posY) ? ((posY < 0.75) && ((posX < 1.60) || (posX > 26.40))) : false);
    const underThreePoint = ((posX && posY) ? ((posY > 14.25) && ((posX < 1.60) || (posX > 26.40))) : false);
    const isTreePointRange = outTreePointCircle || aboveThreePoint || underThreePoint;
    const isTreePointRangeDefensive = outTreePointCircleDefensive || aboveThreePoint || underThreePoint;
    const inFreeThrowCircleLeft = ((posX && posY) ? (((posX - 5.80) ** 2 + (posY - 7.5) ** 2 < (1.80 ** 2)) && (posX > 5.80)) : false);
    const inFreeThrowCircleRight = ((posX && posY) ? (((22.20 - posX) ** 2 + (posY - 7.5) ** 2 < (1.80 ** 2)) && (posX < 22.20)) : false);
    const isFreeThrowRange = (inFreeThrowCircleLeft && !(defensiveCourtIsLeft)) || (inFreeThrowCircleRight && defensiveCourtIsLeft);
    const playerpossession = (player?.homeTeam && possession === "Home") || (!(player?.homeTeam) && possession === "Away")
    const offense = ((defensiveCourtIsLeft && isLeftValue === false) || (!defensiveCourtIsLeft && isLeftValue === true))
    console.log(isTreePointRange, isFreeThrowRange, playerpossession, offense);
    let probable: number[] = [];
    if (playerpossession) {
      if (offense) {
        if (isTreePointRange) probable = [5, 6, 7, 8, 11, 17];
        else if (isFreeThrowRange) probable = [1, 2, 3, 4, 7, 8, 11, 17];
        else probable = [3, 4, 7, 8, 11, 17];
      } else {
        probable = [7, 8, 17];
      }
    } else {
      if (offense) {
        probable = [9, 13, 15];
      } else {
        if (isTreePointRangeDefensive) probable = [9, 10, 13, 14, 15, 16];
        else probable = [9, 10, 12, 13, 14, 15];
      }
    }
    setProbableActions(probable);
    setOtherActions(allActions.filter((a) => !probable.includes(a)));
  }, [posX, posY, possession, player, direction]);

  if (!isOpen) return null;

  return (
    <div className="modal action" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="SeasonModalTitle">
      <div className="modal-backdrop action" onClick={onClose} />
      <div className={isLeft ? "modal-content left" : "modal-content right"}>
        <header className="modal-header">
          <div id="ActionModalTitle">Select Action for {playerdb?.firstName} {playerdb?.lastName} # {player?.shirtNumber}</div>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="modal-body">
          <div className='info-container action'>
            <div className="action-set">
              {probableActions.map((action) => {
                const type = ActionTypes.filter((a) => (a.id === action));
                return (
                  <div className="action-label" id={type[0].id.toLocaleString()} onClick={onSave} >{type[0].label}
                    <span className='action-tooltip'>{type[0].name}</span>
                  </div>
                );
              })}
            </div>
            <div className="action-set">
              {otherActions.map((action) => {
                const type = ActionTypes.filter((a) => (a.id === action));
                return (
                  <div className="action-label other" id={type[0].id.toLocaleString()} onClick={onSave} >{type[0].label}
                    <span className='action-tooltip'>{type[0].name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
