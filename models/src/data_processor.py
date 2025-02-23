import pandas as pd
import numpy as np
import ta
from typing import Dict, List
from pycoingecko import CoinGeckoAPI
from datetime import datetime, timedelta

class DataProcessor:
    def __init__(self):
        self.cg = CoinGeckoAPI()
        
    def fetch_crypto_data(self, coin_id: str = 'bitcoin', days: int = 90) -> pd.DataFrame:
        """Fetch real cryptocurrency data from CoinGecko"""
        try:
            # Get historical data
            data = self.cg.get_coin_market_chart_by_id(
                id=coin_id,
                vs_currency='usd',
                days=days
            )
            
            # Create DataFrame
            df = pd.DataFrame(data['prices'], columns=['timestamp', 'price'])
            df['volume'] = [x[1] for x in data['total_volumes']]
            df['market_cap'] = [x[1] for x in data['market_caps']]
            
            # Convert timestamp from milliseconds to datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            
            print(f"Successfully fetched {days} days of {coin_id} data")
            return df
            
        except Exception as e:
            print(f"Error fetching data: {e}")
            return self.create_sample_data(days)  # Fallback to sample data
    
    @staticmethod
    def create_sample_data(days: int = 90) -> pd.DataFrame:
        """Create sample price and volume data (fallback method)"""
        print("Using sample data as fallback")
        dates = pd.date_range(end=pd.Timestamp.now(), periods=days)
        
        # Generate sample price data with some trend and volatility
        prices = np.random.normal(loc=100, scale=1, size=days).cumsum()
        volumes = np.random.normal(loc=1000, scale=100, size=days)
        market_caps = prices * volumes * np.random.normal(loc=10, scale=1, size=days)
        
        df = pd.DataFrame({
            'timestamp': dates,
            'price': prices,
            'volume': volumes,
            'market_cap': market_caps
        })
        return df

    @staticmethod
    def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
        """Add comprehensive technical indicators"""
        # Basic price indicators
        df['returns'] = df['price'].pct_change()
        df['log_returns'] = np.log(df['price']).diff()
        
        # Trend indicators
        df['sma_20'] = ta.trend.sma_indicator(df['price'], window=20)
        df['sma_50'] = ta.trend.sma_indicator(df['price'], window=50)
        df['ema_12'] = ta.trend.ema_indicator(df['price'], window=12)
        df['ema_26'] = ta.trend.ema_indicator(df['price'], window=26)
        
        # Momentum indicators
        df['rsi'] = ta.momentum.rsi(df['price'], window=14)
        df['stoch'] = ta.momentum.stoch(df['price'], df['price'], df['price'], window=14)
        df['stoch_signal'] = ta.momentum.stoch_signal(df['price'], df['price'], df['price'], window=14)
        df['cci'] = ta.trend.cci(df['price'], df['price'], df['price'], window=20)
        df['adx'] = ta.trend.adx(df['price'], df['price'], df['price'], window=14)
        
        # MACD
        macd = ta.trend.MACD(df['price'], window_slow=26, window_fast=12, window_sign=9)
        df['macd'] = macd.macd()
        df['macd_signal'] = macd.macd_signal()
        df['macd_diff'] = macd.macd_diff()
        
        # Volatility indicators
        bollinger = ta.volatility.BollingerBands(df['price'], window=20)
        df['bollinger_high'] = bollinger.bollinger_hband()
        df['bollinger_low'] = bollinger.bollinger_lband()
        df['bollinger_mid'] = bollinger.bollinger_mavg()
        df['bollinger_pband'] = bollinger.bollinger_pband()
        df['bollinger_wband'] = bollinger.bollinger_wband()
        
        # ATR and other volatility measures
        df['atr'] = ta.volatility.average_true_range(df['price'], df['price'], df['price'])
        df['daily_volatility'] = df['returns'].rolling(window=20).std()
        
        # Volume indicators
        df['volume_sma_20'] = ta.trend.sma_indicator(df['volume'], window=20)
        df['volume_ema_20'] = ta.trend.ema_indicator(df['volume'], window=20)
        df['force_index'] = ta.volume.force_index(df['price'], df['volume'])
        df['ease_of_movement'] = ta.volume.ease_of_movement(df['price'], df['price'], df['volume'])
        df['volume_price_trend'] = ta.volume.volume_price_trend(df['price'], df['volume'])
        
        # Market cap indicators
        df['mkt_cap_sma_20'] = ta.trend.sma_indicator(df['market_cap'], window=20)
        df['mkt_cap_ratio'] = df['market_cap'] / df['market_cap'].rolling(window=20).mean()
        
        # Additional derived features
        df['price_to_sma_20'] = df['price'] / df['sma_20']
        df['volume_to_sma_20'] = df['volume'] / df['volume_sma_20']
        
        # Fill NaN values
        df = df.fillna(method='ffill').fillna(method='bfill')
        return df

    @staticmethod
    def prepare_sequences(df: pd.DataFrame, sequence_length: int = 10) -> tuple:
        """Prepare sequences for LSTM training"""
        feature_cols = [
            'returns', 'log_returns', 'rsi', 'stoch', 'stoch_signal',
            'cci', 'adx', 'macd', 'macd_signal', 'macd_diff',
            'bollinger_pband', 'bollinger_wband', 'atr', 'daily_volatility',
            'force_index', 'ease_of_movement', 'volume_price_trend',
            'mkt_cap_ratio', 'price_to_sma_20', 'volume_to_sma_20'
        ]
        
        X, y = [], []
        for i in range(len(df) - sequence_length):
            # Create sequence of features
            sequence = df[feature_cols].iloc[i:(i + sequence_length)].values
            X.append(sequence)
            
            # Create target (1 if price goes up, 0 if down)
            price_change = df['price'].iloc[i + sequence_length] > df['price'].iloc[i + sequence_length - 1]
            y.append(1 if price_change else 0)
            
        return np.array(X), np.array(y) 