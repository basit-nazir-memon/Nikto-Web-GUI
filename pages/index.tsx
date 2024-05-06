import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useRef } from 'react';

import styles from '../styles/Home.module.css';

import { ScanEvent, ScanEventType } from '../models';

import ScanningOptions from '../components/ScanningOptions';
import ScannerOutput from '../components/ScannerOutput';

let evtSource: any = null;

const Home: NextPage = () => {
  const outputPanelRef: any = useRef();
  const [scanOptions, setScanOptions] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [events, setEvents] = useState<Array<ScanEvent>>([]);
  const [reportContent, setReportContent] = useState('');

  const appendToEventList = (scanEvent: ScanEvent) => {
    if (scanEvent.content) {
      setEvents(current => [...current, scanEvent]);
      if(outputPanelRef.current)
        outputPanelRef.current.scrollTop = outputPanelRef.current.scrollHeight;
    }
  }

  const closeConnection = () => {
    if (evtSource) evtSource.close();
    setIsScanning(false);
  }

  const handleOptionChange = (event: any) => {
    const name = event.target.name;
    let value = event.target.value;
    if (event.target.type === 'select-multiple') {
      value = Array.from(event.target.selectedOptions, (option: any) => option.value);
    }
    setScanOptions(current => ({...current, [name]: value}));
  }

  const handleScanClick = () => {
    if (isScanning) {
      closeConnection();
      appendToEventList({content: 'Scanning has stopped.', type: ScanEventType.WARNING});
      setReportContent('');
    } else {
      setIsScanning(true);
      setEvents([]);
      setReportContent('');
      let reconnectAttempts = 1;
      const scanOptionsParams = new URLSearchParams(scanOptions);
      const apiUrl = `/api/scan?${scanOptionsParams.toString()}`;
      evtSource = new EventSource(apiUrl);
      evtSource.onmessage = (message: any) => {
        const { type, content, output } = JSON.parse(message.data);
        switch(type) {
          case 'done':
            closeConnection();
            appendToEventList({content, type: ScanEventType.SUCCESS});
            setReportContent(output);
            break;
          case 'error':
            closeConnection();
            appendToEventList({content, type: ScanEventType.WARNING});
            break;
          default:
            // Handles the 'feed' events, sometimes more than one log is sent:
            content.split('+').forEach((item: string) => {
              appendToEventList({content: item, type: ScanEventType.INFO});
            });
        }
      }

      evtSource.onerror = () => {
        if (reconnectAttempts > 3) {
          closeConnection();
          appendToEventList({content: 'Could not connect to the server.', type: ScanEventType.DANGER});
        } else {
          appendToEventList({content: `Connection refused (attempt: ${reconnectAttempts})...`, type: ScanEventType.DANGER});
          reconnectAttempts++;
        }
      }
    }
  }

  return <>
    <Head>
      <title>Information Security Project - Nikto</title>
      <meta name='description' content='Nikto Tool' />
      <meta name='viewport' content='width=device-width, initial-scale=1'></meta>
      <link rel='icon' href='/favicon.ico' />
    </Head>
    <div className={styles.container}>
      <main className='container-fluid'>
        <h1>
          Information Secuity Project
        </h1>
        <h2>
          Web App Analyzer Using Nikto
        </h2>
        <h3>
          Let&apos;s scan the web
        </h3>
        <p className='text-muted'> please enter a hostname...</p>
        <ScanningOptions
          isScanning={isScanning}
          onChangeOption={handleOptionChange}
          onScanClick={handleScanClick} />
        <ScannerOutput
          isScanning={isScanning}
          events={events}
          outputPanelRef={outputPanelRef}
          reportContent={reportContent} />
      </main>
    </div>
  </>
}

export default Home;
