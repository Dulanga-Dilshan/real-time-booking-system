<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusRouteTemplate;

class BusRouteTemplateSeeder extends Seeder
{
    public function run(): void
    {
        BusRouteTemplate::create([
            'name'  => 'Colombo → Kandy',
            'stops' => [
                ['index'=>0,'name'=>'Colombo',   'time_to_arrive'=>0.0, 'distance'=>0,   'lat'=>6.9271, 'lng'=>79.8612],
                ['index'=>1,'name'=>'Kelaniya',  'time_to_arrive'=>0.25,'distance'=>11,  'lat'=>6.9550, 'lng'=>79.9202],
                ['index'=>2,'name'=>'Kadawatha', 'time_to_arrive'=>0.75,'distance'=>17,  'lat'=>6.9560, 'lng'=>79.9510],
                ['index'=>3,'name'=>'Yakkala',   'time_to_arrive'=>1.25,'distance'=>30,  'lat'=>7.0280, 'lng'=>80.0780],
                ['index'=>4,'name'=>'Nittambuwa','time_to_arrive'=>1.5, 'distance'=>40,  'lat'=>7.0480, 'lng'=>80.2120],
                ['index'=>5,'name'=>'Warakapola','time_to_arrive'=>2.0, 'distance'=>55,  'lat'=>7.1590, 'lng'=>80.3300],
                ['index'=>6,'name'=>'Kegalle',   'time_to_arrive'=>2.5, 'distance'=>80,  'lat'=>7.2513, 'lng'=>80.3464],
                ['index'=>7,'name'=>'Mawanella', 'time_to_arrive'=>3.0, 'distance'=>95,  'lat'=>7.2522, 'lng'=>80.4506],
                ['index'=>8,'name'=>'Peradeniya','time_to_arrive'=>3.5, 'distance'=>108, 'lat'=>7.2670, 'lng'=>80.5960],
                ['index'=>9,'name'=>'Kandy',     'time_to_arrive'=>4.0, 'distance'=>115, 'lat'=>7.2906, 'lng'=>80.6337],
            ],
        ]);

        BusRouteTemplate::create([
            'name'  => 'Colombo → Galle',
            'stops' => [
                ['index'=>0,'name'=>'Colombo', 'time_to_arrive'=>0.0,'distance'=>0,   'lat'=>6.9271, 'lng'=>79.8612],
                ['index'=>1,'name'=>'Moratuwa','time_to_arrive'=>0.5,'distance'=>14,  'lat'=>6.7730, 'lng'=>79.8810],
                ['index'=>2,'name'=>'Panadura','time_to_arrive'=>1.0,'distance'=>25,  'lat'=>6.7130, 'lng'=>79.9070],
                ['index'=>3,'name'=>'Wadduwa', 'time_to_arrive'=>1.3,'distance'=>33,  'lat'=>6.6610, 'lng'=>79.9380],
                ['index'=>4,'name'=>'Kalutara','time_to_arrive'=>1.5,'distance'=>42,  'lat'=>6.5854, 'lng'=>79.9607],
                ['index'=>5,'name'=>'Beruwala','time_to_arrive'=>1.8,'distance'=>52,  'lat'=>6.4790, 'lng'=>79.9830],
                ['index'=>6,'name'=>'Bentota', 'time_to_arrive'=>2.0,'distance'=>60,  'lat'=>6.4254, 'lng'=>79.9954],
                ['index'=>7,'name'=>'Hikkaduwa','time_to_arrive'=>2.8,'distance'=>88, 'lat'=>6.1395, 'lng'=>80.1054],
                ['index'=>8,'name'=>'Galle',   'time_to_arrive'=>3.5,'distance'=>116, 'lat'=>6.0535, 'lng'=>80.2210],
            ],
        ]);

        BusRouteTemplate::create([
            'name'  => 'Colombo → Jaffna',
            'stops' => [
                ['index'=>0,'name'=>'Colombo',     'time_to_arrive'=>0.0, 'distance'=>0,   'lat'=>6.9271, 'lng'=>79.8612],
                ['index'=>1,'name'=>'Negombo',     'time_to_arrive'=>1.0, 'distance'=>38,  'lat'=>7.2008, 'lng'=>79.8380],
                ['index'=>2,'name'=>'Chilaw',      'time_to_arrive'=>2.0, 'distance'=>80,  'lat'=>7.5760, 'lng'=>79.7960],
                ['index'=>3,'name'=>'Puttalam',    'time_to_arrive'=>3.0, 'distance'=>135, 'lat'=>8.0362, 'lng'=>79.8283],
                ['index'=>4,'name'=>'Anuradhapura','time_to_arrive'=>5.0, 'distance'=>210, 'lat'=>8.3114, 'lng'=>80.4037],
                ['index'=>5,'name'=>'Vavuniya',    'time_to_arrive'=>7.0, 'distance'=>300, 'lat'=>8.7514, 'lng'=>80.4971],
                ['index'=>6,'name'=>'Kilinochchi', 'time_to_arrive'=>8.5, 'distance'=>365, 'lat'=>9.3803, 'lng'=>80.3770],
                ['index'=>7,'name'=>'Jaffna',      'time_to_arrive'=>10.0,'distance'=>410, 'lat'=>9.6615, 'lng'=>80.0255],
            ],
        ]);

        BusRouteTemplate::create([
            'name'  => 'Kandy → Colombo',
            'stops' => [
                ['index'=>0,'name'=>'Kandy',     'time_to_arrive'=>0.0, 'distance'=>0,   'lat'=>7.2906, 'lng'=>80.6337],
                ['index'=>1,'name'=>'Peradeniya','time_to_arrive'=>0.5, 'distance'=>7,   'lat'=>7.2670, 'lng'=>80.5960],
                ['index'=>2,'name'=>'Mawanella', 'time_to_arrive'=>1.0, 'distance'=>20,  'lat'=>7.2522, 'lng'=>80.4506],
                ['index'=>3,'name'=>'Kegalle',   'time_to_arrive'=>1.5, 'distance'=>35,  'lat'=>7.2513, 'lng'=>80.3464],
                ['index'=>4,'name'=>'Warakapola','time_to_arrive'=>2.0, 'distance'=>60,  'lat'=>7.1590, 'lng'=>80.3300],
                ['index'=>5,'name'=>'Nittambuwa','time_to_arrive'=>2.5, 'distance'=>75,  'lat'=>7.0480, 'lng'=>80.2120],
                ['index'=>6,'name'=>'Yakkala',   'time_to_arrive'=>3.0, 'distance'=>85,  'lat'=>7.0280, 'lng'=>80.0780],
                ['index'=>7,'name'=>'Kadawatha', 'time_to_arrive'=>3.5, 'distance'=>98,  'lat'=>6.9560, 'lng'=>79.9510],
                ['index'=>8,'name'=>'Kelaniya',  'time_to_arrive'=>3.75,'distance'=>104, 'lat'=>6.9550, 'lng'=>79.9202],
                ['index'=>9,'name'=>'Colombo',   'time_to_arrive'=>4.0, 'distance'=>115, 'lat'=>6.9271, 'lng'=>79.8612],
            ],
        ]);

        BusRouteTemplate::create([
            'name'  => 'Matara → Jaffna',
            'stops' => [
                ['index'=>0, 'name'=>'Matara',             'time_to_arrive'=>0,    'distance'=>0,   'lat'=>5.9489, 'lng'=>80.5352],
                ['index'=>1, 'name'=>'Weligama',            'time_to_arrive'=>0.7,  'distance'=>18,  'lat'=>5.9744, 'lng'=>80.4292],
                ['index'=>2, 'name'=>'Galle',               'time_to_arrive'=>1.5,  'distance'=>45,  'lat'=>6.0328, 'lng'=>80.2168],
                ['index'=>3, 'name'=>'Hikkaduwa',           'time_to_arrive'=>2.0,  'distance'=>65,  'lat'=>6.1407, 'lng'=>80.1017],
                ['index'=>4, 'name'=>'Ambalangoda',         'time_to_arrive'=>2.5,  'distance'=>80,  'lat'=>6.2351, 'lng'=>80.0536],
                ['index'=>5, 'name'=>'Bentota',             'time_to_arrive'=>3.0,  'distance'=>95,  'lat'=>6.4212, 'lng'=>80.0058],
                ['index'=>6, 'name'=>'Kalutara',            'time_to_arrive'=>3.7,  'distance'=>120, 'lat'=>6.5853, 'lng'=>79.9606],
                ['index'=>7, 'name'=>'Panadura',            'time_to_arrive'=>4.0,  'distance'=>135, 'lat'=>6.7132, 'lng'=>79.9129],
                ['index'=>8, 'name'=>'Moratuwa',            'time_to_arrive'=>4.3,  'distance'=>148, 'lat'=>6.7894, 'lng'=>79.8780],
                ['index'=>9, 'name'=>'Colombo',             'time_to_arrive'=>4.7,  'distance'=>160, 'lat'=>6.9271, 'lng'=>79.8612],
                ['index'=>10,'name'=>'Colombo Fort',        'time_to_arrive'=>5.0,  'distance'=>165, 'lat'=>6.9346, 'lng'=>79.8430],
                ['index'=>11,'name'=>'Kelaniya',            'time_to_arrive'=>5.5,  'distance'=>180, 'lat'=>6.9510, 'lng'=>79.8998],
                ['index'=>12,'name'=>'Negombo',             'time_to_arrive'=>6.0,  'distance'=>198, 'lat'=>7.2008, 'lng'=>79.8380],
                ['index'=>13,'name'=>'Puttalam',            'time_to_arrive'=>9.8,  'distance'=>318, 'lat'=>8.0362, 'lng'=>79.8283],
                ['index'=>14,'name'=>'Anuradhapura',        'time_to_arrive'=>12.0, 'distance'=>390, 'lat'=>8.3114, 'lng'=>80.4037],
                ['index'=>15,'name'=>'Medawachchiya',       'time_to_arrive'=>13.2, 'distance'=>435, 'lat'=>8.5212, 'lng'=>80.4928],
                ['index'=>16,'name'=>'Vavuniya',            'time_to_arrive'=>14.2, 'distance'=>475, 'lat'=>8.7514, 'lng'=>80.4971],
                ['index'=>17,'name'=>'Elephant Pass',       'time_to_arrive'=>15.3, 'distance'=>515, 'lat'=>9.1899, 'lng'=>80.4174],
                ['index'=>18,'name'=>'Kilinochchi',         'time_to_arrive'=>15.8, 'distance'=>535, 'lat'=>9.3803, 'lng'=>80.3770],
                ['index'=>19,'name'=>'Chavakachcheri',      'time_to_arrive'=>17.0, 'distance'=>568, 'lat'=>9.6430, 'lng'=>80.1630],
                ['index'=>20,'name'=>'Jaffna',              'time_to_arrive'=>17.7, 'distance'=>585, 'lat'=>9.6615, 'lng'=>80.0255],
            ],
        ]);

        BusRouteTemplate::create([
            'name'  => 'Galle → Colombo',
            'stops' => [
                ['index'=>0,'name'=>'Galle',    'time_to_arrive'=>0.0,'distance'=>0,   'lat'=>6.0535,'lng'=>80.2210],
                ['index'=>1,'name'=>'Hikkaduwa','time_to_arrive'=>0.7,'distance'=>28,  'lat'=>6.1395,'lng'=>80.1054],
                ['index'=>2,'name'=>'Bentota',  'time_to_arrive'=>1.5,'distance'=>56,  'lat'=>6.4254,'lng'=>79.9954],
                ['index'=>3,'name'=>'Beruwala', 'time_to_arrive'=>1.7,'distance'=>64,  'lat'=>6.4790,'lng'=>79.9830],
                ['index'=>4,'name'=>'Kalutara', 'time_to_arrive'=>2.0,'distance'=>74,  'lat'=>6.5854,'lng'=>79.9607],
                ['index'=>5,'name'=>'Wadduwa',  'time_to_arrive'=>2.2,'distance'=>83,  'lat'=>6.6610,'lng'=>79.9380],
                ['index'=>6,'name'=>'Panadura', 'time_to_arrive'=>2.5,'distance'=>91,  'lat'=>6.7130,'lng'=>79.9070],
                ['index'=>7,'name'=>'Moratuwa','time_to_arrive'=>3.0,'distance'=>102,  'lat'=>6.7730,'lng'=>79.8810],
                ['index'=>8,'name'=>'Colombo',  'time_to_arrive'=>3.5,'distance'=>116, 'lat'=>6.9271,'lng'=>79.8612],
            ],
        ]);
    }
}