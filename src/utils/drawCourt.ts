interface DrawCourtConfig {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement | null;
  setOriginX: (x: number) => void;
  setOriginY: (y: number) => void;
  setScale: (scale: number) => void;
  shotX?: number; // x hernoemd naar shotX om verwarring met baseX te voorkomen
  shotY?: number;
}

interface DrawActionConfig {
  ctx: CanvasRenderingContext2D;
  originX: number;
  originY: number;
  scale: number;
  shotX: number;
  shotY: number;
  color: string;
}

export const drawCourt = ({
  ctx,
  canvas,
  setOriginX,
  setOriginY,
  setScale,
  shotX,
  shotY,
}: DrawCourtConfig) => {
  const M = {
    L: 28.0,
    W: 15.0,
    centreCircleR: 1.80,
    LaneW: 4.90,
    ftLaneFromEnd: 5.80,
    threePtR: 6.75,
    CentreRimFromEnd: 1.60,
    ftCircleR: 1.80,
    treePtMinSide: 0.75,
    restrictedR: 1.25,
  };

  const Equip = {
    backboardFromEnd: 1.20,
    rimFromBoard: 0.175,
    rimR: 0.225,
    boardH: 1.83,
    boardW: 0.03
  };

  const cssW = canvas ? canvas.clientWidth : 0;
  const cssH = canvas ? canvas.clientHeight : 0;
  
  if (canvas) {
    canvas.width = cssW * devicePixelRatio;
    canvas.height = cssH * devicePixelRatio;
  }
  
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  
  const MarginPx = 1;
  const usableW = cssW - 2 * MarginPx;
  const usableH = cssH - 2 * MarginPx;
  const scale = Math.min(usableW / M.L, usableH / M.W);

  const origin = {
    x: (cssW - M.L * scale) / 2,
    y: (cssH - M.W * scale) / 2,
  };

  // Deze functies worden nu veilig uitgevoerd via de parameters
  setOriginX(origin.x);
  setOriginY(origin.y);
  setScale(scale);

  const mx = (m: number) => origin.x + m * scale;
  const my = (m: number) => origin.y + m * scale;

  ctx.clearRect(0, 0, cssW, cssH);
  ctx.strokeStyle = 'rgb(0, 143, 67)';
  ctx.lineWidth = 2;

  // 1. Buitenste lijnen
  ctx.strokeRect(mx(0), my(0), M.L * scale, M.W * scale);

  // 2. Middellijn
  ctx.beginPath();
  ctx.moveTo(mx(M.L / 2), my(0));
  ctx.lineTo(mx(M.L / 2), my(M.W));
  ctx.stroke();

  // 3. Middencirkel
  ctx.beginPath();
  ctx.arc(mx(M.L / 2), my(M.W / 2), M.centreCircleR * scale, 0, 2 * Math.PI);
  ctx.stroke();

  // 4. Buckets
  ctx.strokeRect(mx(0), my((M.W - M.LaneW) / 2), M.ftLaneFromEnd * scale, M.LaneW * scale);
  ctx.strokeRect(mx(M.L - M.ftLaneFromEnd), my((M.W - M.LaneW) / 2), M.ftLaneFromEnd * scale, M.LaneW * scale);

  // 5. Vrijeworpcirkels
  [0, M.L].forEach(baseX => {
    const dir = baseX === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.arc(mx(baseX + dir * M.ftLaneFromEnd), my(M.W / 2), M.ftCircleR * scale, Math.PI / 2, -Math.PI / 2, baseX === 0);
    ctx.stroke();
  });

  // 6. Driepuntslijnen
  const straightLineL = Math.sqrt(Math.pow(M.threePtR, 2) - Math.pow((M.W / 2) - M.treePtMinSide, 2));
  const arcAngle = Math.asin(((M.W / 2) - M.treePtMinSide) / M.threePtR);

  [0, M.L].forEach(baseX => {
    const dir = baseX === 0 ? 1 : -1;
    const rimX = baseX + dir * M.CentreRimFromEnd;

    ctx.beginPath();
    ctx.moveTo(mx(baseX), my(M.treePtMinSide));
    ctx.lineTo(mx(rimX + dir * straightLineL), my(M.treePtMinSide));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(mx(baseX), my(M.W - M.treePtMinSide));
    ctx.lineTo(mx(rimX + dir * straightLineL), my(M.W - M.treePtMinSide));
    ctx.stroke();

    ctx.beginPath();
    if (baseX === 0) {
      ctx.arc(mx(rimX), my(M.W / 2), M.threePtR * scale, -arcAngle, arcAngle, false);
    } else {
      ctx.arc(mx(rimX), my(M.W / 2), M.threePtR * scale, Math.PI - arcAngle, Math.PI + arcAngle, false);
    }
    ctx.stroke();
  });

  // 7. Restricted areas
  [0, M.L].forEach(baseX => {
    const dir = baseX === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.arc(mx(baseX + dir * M.CentreRimFromEnd), my(M.W / 2), M.restrictedR * scale, Math.PI / 2, -Math.PI / 2, baseX === 0);
    ctx.stroke();
  });

  // 8. Backboards
  [0, M.L].forEach(baseX => {
    const dir = baseX === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(mx(baseX + dir * Equip.backboardFromEnd), my((M.W - Equip.boardH) / 2));
    ctx.lineTo(mx(baseX + dir * Equip.backboardFromEnd), my((M.W + Equip.boardH) / 2));
    ctx.stroke();
  });

  // 9. Ringen
  [0, M.L].forEach(baseX => {
    const dir = baseX === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.arc(mx(baseX + dir * (Equip.backboardFromEnd + Equip.rimFromBoard + Equip.rimR)), my(M.W / 2), Equip.rimR * scale, 0, 2 * Math.PI);
    ctx.stroke();
  });

  // 10. Bord naar ring verbinding
  [0, M.L].forEach(baseX => {
    const dir = baseX === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(mx(baseX + dir * (Equip.backboardFromEnd + Equip.boardW)), my(M.W / 2));
    ctx.lineTo(mx(baseX + dir * (Equip.backboardFromEnd + Equip.rimFromBoard)), my(M.W / 2));
    ctx.stroke();
  });

  // 11. Schotlocatie indicator
  if (shotX !== undefined && shotY !== undefined) {
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.arc(mx(shotX), my(shotY), 0.05 * scale, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(mx(shotX), my(shotY), 0.2 * scale, 0, 2 * Math.PI);
    ctx.stroke();
  }
};

export const drawAction = ({
  ctx,
  originX,
  originY,
  scale,
  shotX,
  shotY,
  color,
}: DrawActionConfig) => {
  
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  const mx = (m: number) => originX + m * scale;
  const my = (m: number) => originY + m * scale;

  if (shotX !== undefined && shotY !== undefined) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.arc(mx(shotX), my(shotY), 0.1 * scale, 0, 2 * Math.PI);
    ctx.stroke();
  }
};