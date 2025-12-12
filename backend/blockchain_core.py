import hashlib
import json
import time

class SQLBlockchain:
    def __init__(self, db_connection):
        self.conn = db_connection

    def calculate_hash(self, index, previous_hash, timestamp, data, nonce):
        """
        Creates the SHA-256 'Fingerprint' of the block.
        """
        # Ensure JSON is sorted so hash is consistent
        data_str = json.dumps(data, sort_keys=True)
        payload = f"{index}{previous_hash}{timestamp}{data_str}{nonce}"
        return hashlib.sha256(payload.encode()).hexdigest()

    def get_last_block(self):
        with self.conn.cursor() as cur:
            cur.execute("SELECT block_index, block_hash FROM blockchain_blocks ORDER BY block_index DESC LIMIT 1")
            row = cur.fetchone()
            if row:
                return {"index": row[0], "hash": row[1]}
            # Genesis Block (First block if DB is empty)
            return {"index": -1, "hash": "0" * 64}

    def mine_block(self, data):
        """
        'Mines' a new block: Finds a nonce where hash starts with '00' (Difficulty).
        This proves computational work was done to secure the record.
        """
        last_block = self.get_last_block()
        new_index = last_block['index'] + 1
        prev_hash = last_block['hash']
        timestamp = str(time.time())
        nonce = 0
        
        # Simple Proof-of-Work: Hash must start with "00"
        while True:
            block_hash = self.calculate_hash(new_index, prev_hash, timestamp, data, nonce)
            if block_hash.startswith("00"): 
                break
            nonce += 1
            
        return {
            "index": new_index,
            "previous_hash": prev_hash,
            "timestamp": timestamp,
            "data": json.dumps(data), # Store JSON string
            "nonce": nonce,
            "block_hash": block_hash
        }