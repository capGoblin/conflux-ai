import os
import time
import torch
import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import StandardScaler
from src.model import SimpleLSTM
from src.data_processor import DataProcessor

# Import the Secret SDK components according to the documentation
from secret_ai_sdk.secret_ai import ChatSecret
from secret_ai_sdk.secret import Secret

class TradingAgent:
    def __init__(self):
        # Define the same 20 feature columns used during training
        self.feature_cols = [
            'returns', 'log_returns', 'rsi', 'stoch', 'stoch_signal',
            'cci', 'adx', 'macd', 'macd_signal', 'macd_diff',
            'bollinger_pband', 'bollinger_wband', 'atr', 'daily_volatility',
            'force_index', 'ease_of_movement', 'volume_price_trend',
            'mkt_cap_ratio', 'price_to_sma_20', 'volume_to_sma_20'
        ]
        self.global_model = None
        self.initial_balance = 100000
        self.balance = self.initial_balance
        self.positions = 0

        # Set LLM call frequency (only call LLM every 50 days)
        self.llm_call_frequency = 100

        # Initialize the Secret client and get the LLM instance URLs and models
        try:
            self.secret_client = Secret()
            self.models = self.secret_client.get_models()
            self.urls = self.secret_client.get_urls(model=self.models[0])
            # Initialize the ChatSecret LLM instance
            self.secret_ai_llm = ChatSecret(
                base_url=self.urls[0],
                model=self.models[0],
                temperature=1.0
            )
            print("Secret AI LLM initialized successfully.")
        except Exception as e:
            print(f"Warning: Failed to initialize Secret AI LLM: {e}")
            self.secret_ai_llm = None  # Fallback to threshold-based decisions

    def update_global_model(self):
        """Load the global model from saved weights (local file)"""
        weights_path = 'data/global_model_weights1.pth'
        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Global model weights file not found at {weights_path}")
        
        input_size = len(self.feature_cols)
        model = SimpleLSTM(input_size=input_size, hidden_size=128)
        model.load_state_dict(torch.load(weights_path))
        model.eval()  # Set model to evaluation mode
        self.global_model = model
        print("Global model loaded successfully.")

    def validate_data(self, X_test: torch.Tensor, test_df: pd.DataFrame):
        """Validate that test data and DataFrame are aligned"""
        if len(X_test) != len(test_df):
            raise ValueError(f"Length mismatch: X_test ({len(X_test)}) != test_df ({len(test_df)})")
        
        missing_cols = set(self.feature_cols) - set(test_df.columns)
        if missing_cols:
            raise ValueError(f"Missing features in DataFrame: {missing_cols}")

    def generate_trade_decision(self, prob: float, price: float, day: int) -> str:
        """
        Use LLM decision every 10th trade; otherwise, use simple thresholds.
        """
        # Only call LLM every 10th day to reduce latency
        if day % self.llm_call_frequency == 0 and self.secret_ai_llm:
            prompt = (
                f"Market data: Current price is ${price:.2f}. "
                f"The global model predicted a probability of {prob:.4f} for a price increase. "
                "Based on this, should I 'buy', 'sell', or 'hold'? Respond with a single word."
            )
            try:
                messages = [
                    ("system", "You are a crypto trading agent making decisions based on market data."),
                    ("human", prompt)
                ]
                response = self.secret_ai_llm.invoke(messages, stream=False)
                decision = response.content.strip().lower()
                if decision in ['buy', 'sell', 'hold']:
                    return decision
            except Exception as e:
                print(f"LLM decision error on day {day}: {e}")
        
    # Fallback: use thresholds with a tolerance band of ±0.01 around 0.50
        epsilon = 0.01
        if prob > 0.50 + epsilon:
            return "buy"
        elif prob < 0.50 - epsilon:
            return "sell"
        else:
            return "hold"


    def simulate_trades_on_test_data(self, X_test: torch.Tensor, df: pd.DataFrame) -> list:
        """Simulate trading on test data using the global model and LLM decision-making"""
        trade_log = []
        all_predictions = []
        
        for i in range(len(X_test)):
            with torch.no_grad():
                prob = self.global_model(X_test[i:i+1]).item()
                all_predictions.append(prob)
            
            price = df['price'].iloc[i]
            decision = self.generate_trade_decision(prob, price, day=i)
            
            if decision == "buy" and self.balance >= price:
                self.balance -= price
                self.positions += 1
            elif decision == "sell" and self.positions > 0:
                self.balance += price
                self.positions -= 1
            
            portfolio_value = self.balance + (self.positions * price)
            trade_log.append({
                'day': i,
                'action': decision,
                'price': price,
                'predicted_prob': prob,
                'balance': self.balance,
                'positions': self.positions,
                'portfolio_value': portfolio_value
            })
            
            if (i + 1) % 10 == 0:
                print(f"Day {i+1}: Action={decision}, Price=${price:.2f}, Prob={prob:.4f}, Portfolio=${portfolio_value:.2f}")
        
        predictions = np.array(all_predictions)
        print("\nPrediction Statistics:")
        print(f"Mean probability: {predictions.mean():.4f}")
        print(f"Min probability: {predictions.min():.4f}")
        print(f"Max probability: {predictions.max():.4f}")
        print(f"Std deviation: {predictions.std():.4f}")
        print(f"Predictions > 0.55: {(predictions > 0.55).sum()}")
        print(f"Predictions < 0.45: {(predictions < 0.45).sum()}")
        
        return trade_log

    def run(self, X_test: torch.Tensor, test_df: pd.DataFrame):
        """Main execution flow for the trading agent"""
        self.validate_data(X_test, test_df)
        
        print("Loading global model...")
        self.update_global_model()
        
        print("\nPrice Statistics:")
        print(f"Starting price: ${test_df['price'].iloc[0]:.2f}")
        print(f"Ending price: ${test_df['price'].iloc[-1]:.2f}")
        print(f"Price change: {((test_df['price'].iloc[-1] / test_df['price'].iloc[0]) - 1) * 100:.2f}%")
        
        print("\nSimulating trades on test data...")
        trade_log = self.simulate_trades_on_test_data(X_test, test_df)
        
        final_price = test_df['price'].iloc[-1]
        final_portfolio = self.balance + (self.positions * final_price)
        roi = ((final_portfolio - self.initial_balance) / self.initial_balance) * 100
        
        print("\nTrading Simulation Results:")
        print(f"Initial Balance: ${self.initial_balance:.2f}")
        print(f"Final Balance: ${self.balance:.2f}")
        print(f"Final Positions: {self.positions}")
        print(f"Final Portfolio Value: ${final_portfolio:.2f}")
        print(f"Return on Investment: {roi:.2f}%")
        
        return trade_log

if __name__ == "__main__":
    # Load processed data from CSV
    print("Loading processed data...")
    df = pd.read_csv('data/bitcoin_processed_data.csv')
    
    # Load test data sequences saved during training
    print("Loading test data...")
    X_test = torch.load('data/X_test.pt')
    
    # Adjust the test DataFrame to match the number of sequences in X_test.
    sequence_length = 10
    total_sequences = len(df) - sequence_length
    train_size = int(total_sequences * 0.8)
    test_start_idx = train_size
    test_end_idx = test_start_idx + len(X_test)
    test_df = df.iloc[test_start_idx:test_end_idx]
    
    print(f"\nData shapes:")
    print(f"Total DataFrame rows: {len(df)}")
    print(f"Total possible sequences: {total_sequences}")
    print(f"Training sequences: {train_size}")
    print(f"X_test sequences: {len(X_test)}")
    print(f"Test DataFrame rows: {len(test_df)}")
    
    print("\nInitializing trading agent...")
    agent = TradingAgent()
    trade_log = agent.run(X_test, test_df)
    
    # Save the trade log for analysis
    trade_log_df = pd.DataFrame(trade_log)
    trade_log_df.to_csv('data/trade_log.csv', index=False)
    print("\nTrade log saved to data/trade_log.csv")
