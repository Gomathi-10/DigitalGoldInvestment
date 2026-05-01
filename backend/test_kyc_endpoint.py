import requests

BASE_URL = 'http://localhost:8000/'

def test_kyc_list():
    # 1. Login to get token
    login_url = f"{BASE_URL}login/"
    login_data = {
        "email": "anjali@gmail.com",
        "password": "password123" # I hope this is the password
    }
    
    print(f"Attempting login for {login_data['email']}...")
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code != 200:
            print(f"Login failed: {response.status_code} - {response.text}")
            return
        
        token = response.json().get('token')
        print(f"Login successful. Token: {token[:10]}...")
        
        # 2. Fetch KYC list
        kyc_url = f"{BASE_URL}admin/kyc/"
        headers = {
            "Authorization": f"Token {token}",
            "Accept": "application/json"
        }
        
        print(f"Fetching KYC list from {kyc_url}...")
        kyc_res = requests.get(kyc_url, headers=headers)
        print(f"Response Status: {kyc_res.status_code}")
        print(f"Response Content: {kyc_res.text[:500]}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_kyc_list()
