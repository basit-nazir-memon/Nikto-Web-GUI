import type { ChangeEventHandler, MouseEventHandler } from 'react';

type ScanningOptionsProps = {
  isScanning: boolean;
  onChangeOption: ChangeEventHandler;
  onScanClick: MouseEventHandler;
}

const ScanningOptions = ({isScanning, onChangeOption, onScanClick}: ScanningOptionsProps) => {
  return <>
    <div className='mb-3'>
      <label htmlFor='host-input' className='visually-hidden'>Enter the hostname to scan:</label>
      <input id='host-input' type='text' className='form-control' name='host' placeholder='https://example.com' onChange={onChangeOption} />
    </div>
    <div className='mb-3'>
      <p>
        <a data-bs-toggle='collapse' href='#more-options' role='button' aria-expanded='false' aria-controls='more-options'>
          Click here to set more options...
        </a>
      </p>
      <div className='collapse' id='more-options'>
        <div className='form-check'>  
          <input id='force-ssl-input' type='checkbox' className='form-check-input' name='forcessl' onChange={onChangeOption} />
          <label htmlFor='force-ssl-input'>Force ssl mode on port</label>
        </div>
        
        <div className='form-check'>  
          <input id='disable-dns-input' type='checkbox' className='form-check-input' name='noLookUp' onChange={onChangeOption} />
          <label htmlFor='disable-dns-input'>Disable DNS lookups</label>
        </div>
        
        <div className='form-check'>  
          <input id='disable-404-input' type='checkbox' className='form-check-input' name='no404' onChange={onChangeOption} />
          <label htmlFor='disable-404-input'>Disable nikto attempting to guess a 404 page</label>
        </div>

        <div className='form-floating mb-3'>  
          <input id='max-time-input' type='number' className='form-control' name='maxTime' onChange={onChangeOption} placeholder='50' />
          <label htmlFor='max-time-input'>Maximum testing time per host:</label>
        </div>

        <div className='form-floating mb-3'>  
          <input id='timeout-input' type='number' className='form-control' name='timeout' onChange={onChangeOption} placeholder='10' />
          <label htmlFor='timeout-input'>Timeout for requests:</label>
        </div>

        <div className='form-floating mb-3'>  
          <input id='port-input' type='number' className='form-control' name='port' onChange={onChangeOption} placeholder='80' />
          <label htmlFor='port-input'>Port:</label>
        </div>
        
        <div className='form-floating mb-3'>  
          <input id='pause-input' type='number' className='form-control' name='pause' onChange={onChangeOption} placeholder='5' />
          <label htmlFor='pause-input'>Pause between tests (seconds, integer or float):</label>
        </div>
        
        <div className='mb-3'>
          <label htmlFor='scan-tunning-input'>Scan tunning:</label>
          <select id='scan-tunning-input' className="form-select form-select-sm" multiple aria-label="scan tunning options" name='tunning' onChange={onChangeOption}>
            <option value="0">0 File Upload</option>
            <option value="1">1 Interesting File / Seen in logs</option>
            <option value="2">2 Misconfiguration / Default File</option>
            <option value="3">3 Information Disclosure</option>
            <option value="4">4 Injection (XSS/Script/HTML)</option>
            <option value="5">5 Remote File Retrieval - Inside Web Root</option>
            <option value="6">6 Denial of Service</option>
            <option value="7">7 Remote File Retrieval - Server Wide</option>
            <option value="8">8 Command Execution / Remote Shell</option>
            <option value="9">9 SQL Injection</option>
            <option value="a">a Authentication Bypass</option>
            <option value="b">b Software Identification</option>
            <option value="c">c Remote Source Inclusion</option>
            <option value="d">d WebService</option>
            <option value="e">e Administrative Console</option>
            <option value="x">x Reverse Tuning Options (i.e., include all except specified)</option>
          </select>
        </div>

        <div className='mb-3'>
          <label htmlFor='display-input'>Display:</label>
          <select id='display-input' className="form-select form-select-sm" multiple aria-label="Display options" name='display' onChange={onChangeOption}>
            <option value="1">1 Show redirects</option>
            <option value="2">2 Show cookies received</option>
            <option value="3">3 Show all 200/OK responses</option>
            <option value="4">4 Show URLs which require authentication</option>
            <option value="D">D Debug output</option>
            <option value="E">E Display all HTTP errors</option>
            <option value="P">P Print progress to STDOUT</option>
            <option value="S">S Scrub output of IPs and hostnames</option>
            <option value="V">V Verbose output</option>
          </select>
        </div>
      </div>
    </div>
    <div className='mb-3'>
      <button type='button' className='btn btn-primary' onClick={onScanClick}>
        { isScanning ?
          <>
            <span className='spinner-border spinner-border-sm scan-status-indicator' role='status' aria-hidden='true'></span>
            <span>&nbsp;&nbsp;Stop Scanning</span>
          </>
          : <span>Start Scanning</span>
        }
      </button>
    </div>
  </>;
};

export default ScanningOptions;
