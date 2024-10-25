import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import { CustomConnectWithSelectAccount } from './LedgerDemo/CustomConnectWithSelectAccount.js';
import { CustomConnectWithGetAccounts } from './LedgerDemo/CustomConnectWithGetAccounts.js';
import { TronLinkAdapterDemo } from './TronLinkAdapterDemo.js';
import { ReactHooksDemo } from './ReactHooksDemo.js';
import { TronLinkEvmAdapter } from '@tronweb3/tronwallet-adapter-tronlink-evm';
import { AdapterBasicTest } from './AdapterBasicTest.js';
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}
function App() {
    const [value, setValue] = React.useState(() => {
        return Number(localStorage.getItem('tab')) || 0;
    });

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        localStorage.setItem('tab', String(newValue));
        setValue(newValue);
    };
    return (
        <div className="App">
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs scrollButtons="auto" variant="scrollable" value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Adapter Basic Usage" />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <AdapterBasicTest />
                </TabPanel>
            </Box>
        </div>
    );
}

export default App;
