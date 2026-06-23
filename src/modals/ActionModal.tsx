import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { useAddLogMutation, useGetActionsQuery, useGetPlayerByIdQuery } from '../services/ScoutingApi';
import type { ModalProps } from '../app/types';
import './Modal.css';
import './ActionModal.css'
import '../styles/index.css'
import '../styles/_tokens.css'

export default function LogModal({ isOpen, onClose }: ModalProps) {
  const { game, player, posX, posY, possession, direction, quarter, secRem } = useSelector((s: RootState) => s.ui.actionModal);

  const { data: playerdb } = useGetPlayerByIdQuery(player?.playerId ?? '', {
    skip: !isOpen || !player?.playerId,
  });

  const { data: actions } = useGetActionsQuery();

  const allActions = actions?.map((a) => a.id);
  const [probableActions, setProbableActions] = useState<string[]>([]);
  const [otherActions, setOtherActions] = useState<string[]>([]);
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
    const isLeftValue = (posX && posX < 14) ? true : false;
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
    let probable: string[] = [];
    if (playerpossession) {
      if (offense) {
        if (isTreePointRange) probable = ["5", "6", "7", "8", "11", "17"];
        else if (isFreeThrowRange) probable = ["1", "2", "3", "4", "7", "8", "11", "17"];
        else probable = ["3", "4", "7", "8", "11", "17"];
      } else {
        probable = ["7", "8", "17"];
      }
    } else {
      if (offense) {
        probable = ["9", "13", "15"];
      } else {
        if (isTreePointRangeDefensive) probable = ["9", "10", "13", "14", "15", "16"];
        else probable = ["9", "10", "12", "13", "14", "15"];
      }
    }
    setProbableActions(probable);
    setOtherActions(allActions?.filter((a) => !probable.includes(a)) ?? []);
  }, [posX, posY, possession, player, direction]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.repeat) return;
      (event.key === 'q') ? onClose() : null;
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
  
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
                const type = actions?.find((a) => (a.id === action));
                return (
                  <div className="action-label" id={type?.id.toLocaleString()} onClick={onSave} >{type?.label}
                    <span className='action-tooltip'>{type?.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="action-set">
              {otherActions.map((action) => {
                const type = actions?.find((a) => (a.id === action));
                return (
                  <div className="action-label other" id={type?.id.toLocaleString()} onClick={onSave} >{type?.label}
                    <span className='action-tooltip'>{type?.name}</span>
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
