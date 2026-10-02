import * as React from 'react';
import { useContext } from 'react';
import { BoardContext } from '../../context/board-context';
import { getStrings } from '../../lib/strings';

const style: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
  backgroundColor: '#efefef',
  color: '#b4b4b4',
  width: '95%',
  height: '100%',
  minHeight: 50
}

const NoResults = () => {
  const { locale } = useContext(BoardContext);
  return ( 
    <div style={style}>
      <p>{getStrings(locale).emptyColumnLabel}</p>
    </div>
  );
}

export default NoResults;
