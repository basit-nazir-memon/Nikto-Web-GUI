import { useState, useEffect } from 'react';
import { ScanEvent } from '../models';

type ScannerOutputProps = {
  isScanning: boolean;
  events: Array<ScanEvent>;
  outputPanelRef: any;
  reportContent?: string;
}

let evtSource: any = null;

const ScannerOutput = ({events, isScanning, outputPanelRef, reportContent}: ScannerOutputProps) => {
  const [showOutputPanel, setShowOutputPanel] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState('');


  useEffect(() => {
    if (reportContent) {
      const file = new Blob([reportContent], {type: 'application/html'});
      setDownloadUrl(URL.createObjectURL(file));
    }
  }, [reportContent]);

  const toggleOutputPanel = () => {
    setShowOutputPanel(current => !current);
  }

  const fetchResults = () =>{
    setShowResults(!showResults);
    const apiUrl = `/analyzeresults`;
    evtSource = new EventSource(apiUrl);
    evtSource.onmessage = (message: any) => {
      setResultsData(JSON.parse(message.data));
      console.log(resultsData);
    }
  }
  return <>
    <div style={{textAlign: 'right'}}>
      <a className='btn btn-link' onClick={toggleOutputPanel}>{ showOutputPanel ? "Hide Panel" : "Show Panel" }</a>
      <a className={`btn btn-link ${!downloadUrl && 'disabled'}`} href={downloadUrl} download>Download Report</a>
      <a className={`btn btn-link ${!downloadUrl && 'disabled'}`} href={downloadUrl}>View Report</a>
      <button className={`btn btn-link ${!downloadUrl && 'disabled'}`}  onClick={fetchResults}>View Analyzed Results</button>
    </div>
    { showOutputPanel && !showResults && <div className='card' id='output-panel' ref={outputPanelRef} style={{height: '600px', overflowY: 'scroll'}}>
      <div className='card-body'>
        <div className='card-text'>
          { events.map((item, idx) => (
            <p className={`text-bg-${item.type} p-2 mb-2 fw-lighter`} key={`scan-event-${idx}`}>
              {item.content}
            </p>
          ))}
        </div>
        <div className='card-text'>
          { isScanning && 
            <div className='spinner-grow scan-status-indicator text-secondary' role='status'>
              <span className='visually-hidden'>Scanning...</span>
            </div>
          }
        </div>
      </div>
    </div> }

    { showResults && <div className='card' id='output-panel' ref={outputPanelRef} style={{height: '600px', overflowY: 'scroll'}}>
      <div className='card-body'>
        <div className='card-text'>
          {resultsData}
        </div>
      </div>
    </div> }

  </>
};

export default ScannerOutput;
