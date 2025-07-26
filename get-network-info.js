import { networkInterfaces } from 'os'

const getNetworkInfo = () => {
  console.log('🌐 NETWORK SETUP FOR MOBILE ACCESS')
  console.log('=====================================')
  
  const nets = networkInterfaces()
  const results = {}

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = []
        }
        results[name].push(net.address)
      }
    }
  }

  console.log('\n📱 MOBILE ACCESS URLs:')
  console.log('----------------------')
  
  if (Object.keys(results).length === 0) {
    console.log('❌ No network interfaces found for external access')
    console.log('💡 Make sure your computer is connected to WiFi or Ethernet')
  } else {
    Object.keys(results).forEach(interfaceName => {
      results[interfaceName].forEach(ip => {
        console.log(`✅ ${interfaceName}: http://${ip}:5173`)
      })
    })
  }

  console.log('\n🔧 SETUP INSTRUCTIONS:')
  console.log('----------------------')
  console.log('1. Make sure your phone is on the SAME WiFi network as your computer')
  console.log('2. Start the development server: npm run dev:full')
  console.log('3. Use one of the URLs above on your phone\'s browser')
  console.log('4. If it doesn\'t work, check Windows Firewall settings')
  
  console.log('\n🛡️ FIREWALL SETUP (if needed):')
  console.log('-------------------------------')
  console.log('1. Open Windows Defender Firewall')
  console.log('2. Click "Allow an app or feature through Windows Defender Firewall"')
  console.log('3. Click "Change settings" and "Allow another app"')
  console.log('4. Browse to your Node.js installation (usually C:\\Program Files\\nodejs\\node.exe)')
  console.log('5. Make sure both Private and Public are checked')
  
  console.log('\n📋 TROUBLESHOOTING:')
  console.log('-------------------')
  console.log('• If connection fails, try turning off Windows Firewall temporarily')
  console.log('• Ensure both devices are on the same network')
  console.log('• Check that ports 5173 and 3001 are not blocked')
  console.log('• Try using your computer\'s hostname instead of IP')
  
  console.log('\n🎯 READY TO TEST!')
  console.log('==================')
}

getNetworkInfo() 