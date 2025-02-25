import torch
import numpy as np
from src.data_processor import DataProcessor
from src.model import LocalTrainer, aggregate_models
from src.trader import (MomentumTrader, MeanReversionTrader, BreakoutTrader,
                       TrendFollowingTrader, RSITrader, VolumeBasedTrader)
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
import pandas as pd
from typing import Dict, List
from tqdm import tqdm
import requests
import os

def evaluate_model(model, X_test, y_test):
    """Evaluate model performance and return metrics"""
    with torch.no_grad():
        predictions = model(X_test)
        pred_labels = (predictions > 0.5).float()
        
        # Calculate metrics
        accuracy = accuracy_score(y_test.numpy(), pred_labels.numpy())
        precision = precision_score(y_test.numpy(), pred_labels.numpy())
        recall = recall_score(y_test.numpy(), pred_labels.numpy())
        f1 = f1_score(y_test.numpy(), pred_labels.numpy())
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1
        }

def scale_features(X_train, X_test):
    """Scale features using StandardScaler"""
    # Reshape to 2D array for scaling
    n_samples_train, n_sequences, n_features = X_train.shape
    n_samples_test = X_test.shape[0]
    
    X_train_reshaped = X_train.reshape(-1, n_features)
    X_test_reshaped = X_test.reshape(-1, n_features)
    
    # Fit scaler on training data and transform both sets
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_reshaped)
    X_test_scaled = scaler.transform(X_test_reshaped)
    
    # Reshape back to 3D
    X_train_scaled = X_train_scaled.reshape(n_samples_train, n_sequences, n_features)
    X_test_scaled = X_test_scaled.reshape(n_samples_test, n_sequences, n_features)
    
    return X_train_scaled, X_test_scaled

def backtest_trader(trader_class, df: pd.DataFrame, training_end_idx: int):
    """Backtest a trading strategy"""
    trader = trader_class(initial_balance=100000)
    timestamps = df['timestamp'].tolist()[:training_end_idx]
    
    performance_data = []
    for idx in tqdm(range(len(timestamps)), desc=f"Backtesting {trader_class.__name__}"):
        timestamp = timestamps[idx]
        daily_portfolio = trader.balance
        
        # Get trading signal
        action, position_size = trader.should_trade(
            coin='bitcoin',  # Using only BTC for now
            df=df,
            idx=idx
        )
        
        if action != 0:
            features = trader.get_technical_features(df, idx)
            trader.execute_trade(
                timestamp=timestamp,
                coin='bitcoin',
                price=df['price'].iloc[idx],
                action=action,
                position_size=position_size,
                features=features
            )
        
        # Calculate daily portfolio value
        if 'bitcoin' in trader.positions:
            daily_portfolio += trader.positions['bitcoin'] * df['price'].iloc[idx]
        
        performance_data.append({
            'timestamp': timestamp,
            'portfolio_value': daily_portfolio
        })
    
    performance_df = pd.DataFrame(performance_data)
    return trader.trades, performance_df

def generate_training_data(df: pd.DataFrame) -> tuple[Dict, Dict]:
    """Generate training data from multiple traders using different strategies"""
    training_end_idx = int(len(df) * 0.8)
    
    if training_end_idx < 50:
        raise ValueError("Training period must be at least 50 days")

    # Define different types of traders
    trader_types = {
        'momentum_trader': MomentumTrader,
        'mean_reversion_trader': MeanReversionTrader,
        'breakout_trader': BreakoutTrader,
        'trend_following_trader': TrendFollowingTrader,
        'rsi_trader': RSITrader,
        'volume_trader': VolumeBasedTrader
    }
    
    all_trades = {}
    all_trader_performances = {}
    
    for trader_name, trader_class in trader_types.items():
        print(f"\nBacktesting for {trader_name}...")
        try:
            trades, performance = backtest_trader(
                trader_class, 
                df,
                training_end_idx
            )
            all_trades[trader_name] = trades
            all_trader_performances[trader_name] = performance
            print(f"Generated {len(trades)} trades for {trader_name}")
            
            # Calculate trader's performance
            initial_value = 100000
            final_value = performance['portfolio_value'].iloc[-1]
            total_return = ((final_value - initial_value) / initial_value) * 100
            print(f"Trader Return: {total_return:.2f}%")
            
        except Exception as e:
            print(f"Error backtesting {trader_name}: {e}")
            continue
    
    return all_trades, all_trader_performances

def upload_model_weights(file_path: str, server_url="http://localhost:3000") -> str:
    """
    Upload model weights to server by sending the file path
    
    Args:
        file_path (str): Path to the model weights file
        server_url (str): Base URL of the server
        
    Returns:
        str: CID of the uploaded file
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Model weights file not found at {file_path}")
    
    # Prepare the file for upload
    with open(file_path, 'rb') as f:
        files = {'file': f}  # Use 'file' as the key to match multer's field name

        # Send POST request with the file
        response = requests.post(f"{server_url}/upload", files=files)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Model weights uploaded successfully. Response: {result}")
        return result.get('cid')
    else:
        raise Exception(f"Upload failed: {response.text}")

def main():
    # Configuration
    days = 365  # 1 year of data
    sequence_length = 10
    epochs = 30
    
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Initialize data processor
    dp = DataProcessor()
    
    print("\nFetching Bitcoin data...")
    # Fetch and process data
    df = dp.fetch_crypto_data(coin_id='bitcoin', days=days)
    
    # Save raw data
    raw_data_path = 'data/bitcoin_raw_data.csv'
    df.to_csv(raw_data_path, index=False)
    print(f"Raw data saved to {raw_data_path}")
    
    # Add indicators and save processed data
    df = dp.add_indicators(df)
    processed_data_path = 'data/bitcoin_processed_data.csv'
    df.to_csv(processed_data_path, index=False)
    print(f"Processed data with indicators saved to {processed_data_path}")
    
    # Generate training data from multiple traders
    print("\nGenerating training data from multiple traders...")
    all_trades, all_trader_performances = generate_training_data(df)
    
    # Prepare sequences for LSTM training
    X, y = dp.prepare_sequences(df, sequence_length)
    
    # Split data
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    # Scale features
    X_train_scaled, X_test_scaled = scale_features(X_train, X_test)
    
    # Convert to tensors
    X_train = torch.FloatTensor(X_train_scaled)
    y_train = torch.FloatTensor(y_train).reshape(-1, 1)
    X_test = torch.FloatTensor(X_test_scaled)
    y_test = torch.FloatTensor(y_test).reshape(-1, 1)
    
    # Save X_test tensor for trading agent
    torch.save(X_test, 'data/X_test.pt')
    print(f"Test data saved to data/X_test.pt")
    
    # Train and evaluate model for each trader
    trader_models = {}
    trader_performances = {}
    
    for trader_name, trades in all_trades.items():
        print(f"\nTraining model for {trader_name}...")
        
        # Create and train model
        trainer = LocalTrainer(input_size=X_train.shape[2])
        model_weights = trainer.train(X_train, y_train, epochs=epochs)
        trader_models[trader_name] = model_weights
        
        # Evaluate model
        trainer.model.load_state_dict(model_weights)
        metrics = evaluate_model(trainer.model, X_test, y_test)
        trader_performances[trader_name] = metrics
        
        print(f"Trader Performance:")
        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"F1 Score: {metrics['f1']:.4f}")
    
    # Aggregate models from all traders
    print("\nAggregating models from all traders...")
    global_weights = aggregate_models(list(trader_models.values()))
    
    # Create global model and load aggregated weights
    global_model = LocalTrainer(input_size=X_train.shape[2]).model
    global_model.load_state_dict(global_weights)
    
    # Save the global model weights to the data directory
    weights_path = 'data/global_model_weights1.pth'
    torch.save(global_model.state_dict(), weights_path)
    print(f"Global model weights saved to {weights_path}")
    
    # Upload the saved weights using file path
    try:
        cid = upload_model_weights(weights_path)
        if cid:
            # Save the CID to a file for future reference
            with open('data/model_cid.txt', 'w') as f:
                f.write(cid)
            print(f"Model CID saved to data/model_cid.txt")
    except Exception as e:
        print(f"Error during upload: {e}")
    
    # Evaluate global model
    print("\nGlobal Model Performance:")
    global_metrics = evaluate_model(global_model, X_test, y_test)
    print(f"Accuracy: {global_metrics['accuracy']:.4f}")
    print(f"Precision: {global_metrics['precision']:.4f}")
    print(f"Recall: {global_metrics['recall']:.4f}")
    print(f"F1 Score: {global_metrics['f1']:.4f}")
    
    # Analyze predictions on test data
    with torch.no_grad():
        test_predictions = global_model(X_test)
        pred_labels = (test_predictions > 0.5).float()
        true_labels = y_test
        
        correct_predictions = (pred_labels == true_labels).sum().item()
        incorrect_predictions = (pred_labels != true_labels).sum().item()
        
        print("\nPrediction Analysis on Test Data:")
        print(f"Total test samples: {len(y_test)}")
        print(f"Correct predictions: {correct_predictions}")
        print(f"Incorrect predictions: {incorrect_predictions}")
        print(f"Accuracy: {(correct_predictions / len(y_test)) * 100:.2f}%")
    
    # After evaluating models for each trader
    contributions = {}

    for trader_name, metrics in trader_performances.items():
        contributions[trader_name] = metrics['accuracy']  # Use accuracy as a measure of contribution

    # Normalize contributions to sum to 10
    contribution_sum = sum(contributions.values())
    contributions_normalized = {k: (v / contribution_sum) * 10 for k, v in contributions.items()}

    # Create DataFrame for contributions
    contribution_df = pd.DataFrame(list(contributions_normalized.items()), columns=['Trader Strategy', 'Contribution'])

    # Save contributions to CSV
    contribution_csv_path = 'data/trader_contributions.csv'
    contribution_df.to_csv(contribution_csv_path, index=False)
    print(f"Trader contributions saved to {contribution_csv_path}")

if __name__ == "__main__":
    main() 