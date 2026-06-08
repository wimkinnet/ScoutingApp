export interface GamePlayer {
	playerId: string;
	shirtNumber: number;
	homeTeam: boolean;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}



