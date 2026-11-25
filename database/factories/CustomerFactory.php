<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    public function definition(): array
    {
        $faker = fake('id_ID');
        $nama = $faker->firstName().' '.$faker->lastName();

        return [
            'nama' => $nama,
            'nim_nik' => $faker->unique()->numerify('24########'),
            'instansi' => $faker->randomElement([
                'UKM Musik PENS',
                'Indie Band Surabaya',
                'Komunitas Jazz Surabaya',
                'SMAN 5 Studio Project',
                'Audio Engineering PENS',
                'Akustik Soloist',
            ]),
            'email' => Str::slug($nama, '.').$faker->unique()->numerify('###').'@pens.ac.id',
            'nomor_telepon' => $faker->numerify('08##########'),
            'alamat' => $faker->address(),
            'status' => $faker->randomElement(['aktif', 'aktif', 'aktif', 'nonaktif']),
        ];
    }
}
