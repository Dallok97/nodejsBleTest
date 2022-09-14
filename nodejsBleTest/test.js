const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db/test.json')
const db_test = low(adapter)

const BeaconScanner = require(`node-beacon-scanner`)
const scanner = new BeaconScanner()
var _ = require('lodash')
var macaddress = require(`macaddress`)

db_test.defaults(   {
                        'device' : [], 
                        'area' : {'init' : [],
                                 'enter' :[], 
                                 'work' :[], 
                                 'quit' :[]}, 
                        'vehicle' :{ 'init' : [], 
                                    'enter' :[], 
                                    'work' :[], 
                                    'quit' :[]}
                    }).write()

function main(){
    try{
        scanner.onadvertisement = async (ad) => {
            
            var macAddress = ad.address
            var uuid = ad.iBeacon.uuid
            var rssi = Math.abs(ad.rssi)

            let ts = Date.now();

            var unixToTime = new Date((ts/1000) * 1000)
            var year = `${unixToTime.getFullYear()}`
            var month = `${unixToTime.getMonth()+1}`.padStart(2, '0')
            var day = `${unixToTime.getDate()}`.padStart(2, '0')
            var hours = `${unixToTime.getHours()}`.padStart(2, '0')
            var minutes = `${unixToTime.getMinutes()}`.padStart(2, '0')
            var seconds = `${unixToTime.getSeconds()}`.padStart(2, '0')

            var timeStamp = `${year}${month}${day}${hours}${minutes}${seconds}`
            var boardMac = await macaddress.one(`wlan0`)
            var vehicleNumber = ad.iBeacon.minor

            eval(`db_test.get('device').push({
                                                "macAddress": '${boardMac}',
                                                "number": '${vehicleNumber}',
                                                "forwardingTime": '${timeStamp}'
                                            }).write()`)
            

        }
        scanner.startScan().then(() => {
            console.log('Started to scan.')
        }).catch((error) => {
        console.log(`scanner error`)
        console.error(error)
        })
    }
    catch(err){
            console.log(err)
    }
}
main()




