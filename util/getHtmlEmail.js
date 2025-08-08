const htmlEmailVerify = async(generateOTP, duration = 10) => {
    return `
                <div style="
                    font-family: Arial, sans-serif;
                    background-image: url('https://lh3.googleusercontent.com/fife/ALs6j_EG6si9Vx4NBv3DlHIvQI2tbZK3_KnaaLukUVYqgvhSPMob6iin-zTDSMuAcEv8G_NG4SoRVxXHi6zmlB830kX9tmMRbkm75b7ofCv98sJZXjvZExsT5DPorRKbZhDtmaePI-QrDGxGbAtzWrhY4GbjtRHXcwN4cLnXcf-QzmUIUpAQb6lWt_fL2BMfGPoEb3JE-d2z_NGojAY5wnLbaKz8Hr_ywwWZzH0vG7IKM6_z0x2Lpg8fF3GzBmOCXk8vyskZ9Xx5mqCeYDwAP7v_pNX0t9h_ENfW1yAiOsLPZrcwRINt4wA0gyQx37l2PTkCzDdZhA6IxMOWe1vo6VmZ58J09MlqeYSGizCm_oheUUN13KJzkdyU6YvRBz_8NVlmyL_PJppg2bzrwGbsMyXELwTrpuSt5vQhMkRflNf4JJkDx8ojyB1iCLkmAkwmYJ-F7pAwd168kBltEC8HlUhUgnwpglM3Bv5Zs4YjtxsLPBLJLRjUvuCsjWZw9POSeVb2Xvmat-sJmEYuqM-ZhZYasNQ8ST_d8PXIVuu_l-dhzMvFgtP7ZdDv_Gy8KmB9bw5mL2PuAATp1UpG1gCk-LVQ2lKppToJW_rXhxa0stuGbWSIzkEoit13tFy-o_CPuS0_GNMfx-VEjxWDoKjFDH1D3zA5HMYg_ZCDNik-ry-z9yqTDLmcoEJSgKMVgpUotvX6wIrErQO6Jycf89fo87aWZKohxjP3O-VJyyV6RfEQj9eGSOMYv4EHfnv3Ht90rFQL-BFyNTWKDUITfBnZEfsmsP2Iw_FaHgJqxu52JYVVB34VRrUJc4CfV0KKY79WLAPJ0j0AjbkCfRR8YIgP-PQ9bdmJ3-O1X5DAx5klJJ7B4mGbIiJ11YVokH1T88NIh6wRpifCmh8ECzQCssnfBbe_VjQFpXLZi6r6J1P3_jq9B6Hcp0ClDiNoNRk_Wvk7yVp8VYhcaF3ul-fNRv14gK7Kg2TDW_yEq2vvALsJao5C6aVs71m3Di3ImghfzQyG_8sI_sgzirLnGcfkFBd_wsC2WO93vr1NG7mZNgKD8O_H-8x8BA9JoetxMSH4wXmzMzRO7TmY_iwOBVY8S91lKvSfz5vx4b2-wOB6swa_RqUZq9nhwJ--cP4HKnaAUTyr6sjAuqHjb-R7-33Q-7cevmwLHvzW4vfYaalz3BVnKivE5JNyQR1b7a7RSNZg53_Hbq-tXawq_3e2vSs2GTwQ5vHXN8Y7FCgMrOx9fKTxl4gsDZdcquNH38UbfMMS70p7OAZsgTHCVSV2JyQxIz8CD7GY4FWaJDHe3XW958-ujihCZa4flOng_tgRamngx5c0xtMfXn17RV6FrHFk0kKvHG2Bj3mp6e12CsMiISyQWJb9X5F0US64thbcmrvNnVuVQRbWtDkVsVXrGA6fAkL39gWdVHCoFICExEJSzsLueuV5v61vt7geA9h6vRQ834Po2V-sycleNnh5ZR3N-YRxjPeHuj3yjvdA_SEMwn_0y3HCQQ83D74q36RN-kNnsEzlaw_TBJlxPOWloc_iDCZKjdOYc3EhRdLCLjW_qpkCofd6O-hUrr71H1b53jAjPOAftz5RrYv3KV6028lbjFJKj01LNSTKyw=w1920-h945?auditContext=prefetch');
                    background-size: cover;
                    background-position: center;
                    padding: 30px;
                    border-radius: 8px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                ">

                    <h3 style="color:rgb(255, 255, 255); text-align: center; font-size: 30px; margin: 20px 0px">Welcome to Astrolingo!</h3>

                    <!-- Mascot Image -->
                    <div style="text-align: center; width: 300px; height: 300px; margin: 0 auto 20px auto;">
                        <img src="https://lh3.googleusercontent.com/fife/ALs6j_ECcUu-Nv04jGep0hLq_gtZU6rcqnfewzoGccl5r3BgwW0fM2gkF77RqSr-yCJtiUgyYyAHuYIwirIMxdopjfoRbmpRUr9er3xLy62erzAx8nzs81JpsR2E7uR9iuN7K7EY0KhylDkW4yqAqVZzA_OYKHdRnpHv_wNf4KrSG8BDkg4zMXuvvV75575dpl9Ett6YJtnpGxGrveTVAVobgWwAaWrxi0Is3Ue521M40oAdicZgI2Qb1nEifBrfQ7tK_cNUrD6cW4YIK0bCOugs9DrlSZs7seV0adAhKrpNrQnzIgo0dAUWXQkBfaFQrJOHgSE5wkDNak_KQVdAKe6mYGA3NBxZ4PyrXPtb6ZLBzuRP6XR0mEVfi56SaGLewZzSzs2mIh-UR5Dq9fgpQFHqozIk51BFoQEXZkia9gElLxZ74uFlcN2BabQugnyAOff1OUfFofzp4Y_TYDFkzBuwjiOEXcLHf-cgKImcgLC7TGw-zQ1YCc3Bc9s_zP-xi8sSDha5FgmzXt79s5wPmJ_MsK3hDrXKvilACV73QIBodvnbKjs9qgq0QpAh-jSZp-NTNR-kZHi7JsKThu1-Js0WHU_FH0loojlcC8QR0bXR5ybi7zAa_OkU1a_vcBE2nkzKLYi1FTnjLGz4mGjUUDpdNQ7gUmkqkgmMkG_fgbXcfKegv75kvCerw1M2XXckkmvA-Mh_p1idw4cGaSDr2Ri00bV7ZwYj7pl1VsgoC6WwRrtEE5zyFMWoQIar7KMXgHUVhzrNizeIBwQ79DEb1Y5Dbb9PAUXtRpd2RnEpR9c1hZ-ZTMMEbHh1Uu4lNcb-QGrF9NbkfJ7rRoZJagsSwsNE7OPkIwxxhCFz46QbpCrIZvyzOWXDsfTbPIPB_RzN3cggbC7q42QfwJmu77WWPzZtockAyt__Kr_it5iifyUqII1JukDZgIjZozuf0JULVJaqUnKkOtHHDYCy_g-wV-C_KV8yo4XyvReOSIuSldBgu8U_X6CvQa8k0ICC8Tp1iBrSGbp_bKBOEfqksB9sU31owD6vi8B1v6Fs33x_Pr9nOfyu9nHH1QXZqj0gLiYvo0CeLX0b-4aoI3p24FQGqcJrJTAtvp35tlAT3stX-YdMDmCHqexsU32V9RWMAmj5xFhsT0JRpG_gFbXCTKV1gOJa3MOu9jWjgPEtnN32lwB4vy1FKgM8pfv0iIzHoA7qHBCCbD6K8tAXsoHQ8x--nrX19xBhuCVH3hYBljWtn2wiOtM8IMPK6ssvwXN6KZZIn5bThzJJgPCTlvPQuTRCLtsbREc_2VUxIdb2U8PZkoucwauGfeyud6BVowuQe2aqjfl6IuYOJdXqv4OlwLomPNAyzXysdTL7szLsgTsZrTdjFDDgImqdCOJL0jmaLzKM5vuJczOzTxto9og255Xhrd6ciGBIkNXwXB1kjq8teMhRWm2_ko2GO7X1foxySgJmOQ6_XJDOftMRVkJO1EVKVFg6qp2oh3ZeONA2OB4gSRC0Hmn2Xwg8ysXOT5Da8NfF2tik_r7z7GtAQAM9dCzFs101HOlNhqXppU6fcJ_qCTvSQKNgJhrETZSAvlclf9KsHZ4FO2M3DJjprvO_vr6Vi_bIcN9A6mc=w1365-h945?auditContext=prefetch"
                            alt="Astrolingo Mascot"
                            style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"/>
                    </div>

                    <p style="font-size: 16px; color: rgb(245, 245, 245); line-height: 1.6; text-align: center;">
                        Hello, we received a request to send you an OTP. Please use the code below to verify your account.
                    </p>

                    <div style="background-color: #fff; padding: 20px; text-align: center; border-radius: 6px; margin-top: 20px;">
                        <p style="font-size: 40px; color: #FF5733; font-weight: bold; letter-spacing: 5px; margin: 0;">
                            ${generateOTP}
                        </p>
                        <p style="font-size: 18px; color: #333; margin-top: 20px;">
                            This code <b>expires in ${duration} minute(s)</b>.
                        </p>
                    </div>

                    <div style="margin-top: 30px; text-align: center; font-size: 14px; color: rgb(240, 240, 240);">
                        <p>&copy; 2025 Astrolingo. All rights reserved.</p>
                    </div>
                </div> 
            `
};

module.exports = htmlEmailVerify;